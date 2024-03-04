import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import mongoose, { Model } from 'mongoose';
import * as path from 'path';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { GmailEmailService } from 'src/app/services/email.service';
import { validate_email } from 'src/app/utilities/email_validation';
import { read_html_file } from 'src/app/utilities/process_html_file';
import { ConversationsRepository } from 'src/chat/repositories/conversation.repository';
import { MessagesRepository } from 'src/chat/repositories/message.repository';
import { CONTACT_TYPE } from 'src/contacts/constants';
import { EmailService } from 'src/email/email.service';
import { ERROR_MESSAGES } from 'src/error-handling/constants';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import { v4 as uuidv4 } from 'uuid';
import { DocumentTransformer, EntityResponse } from '../app/utilities';
import { RedisService } from '../redis/redis.service';
import {
  COOKIES,
  USERTYPE,
  Users,
  WidgetConfig,
  WorkSpacePermissions,
  WorkSpaceTeamMates,
  WorkSpaces,
} from './entities';
import { LoginDto, SignUpDto, SocialLoginDto } from './entities/dto';
import { ChangeWorkSpaceDto } from './entities/dto/change_workspace.dto';
import {
  CheckInviteTeamMatesDto,
  DeleteTeamMatesDto,
} from './entities/dto/check_team_mate_invite.dto';
import {
  UpdateWorkSpaceDto,
  WorkSpaceDto,
} from './entities/dto/create_work_space.dto';
import { EmailVerificationDto } from './entities/dto/email_verification.dto';
import {
  InviteTeamMatesDto,
  ResendInviteTeamMateDto,
} from './entities/dto/invite_team_mates.dto';
import {
  ForgotPassword,
  PasswordReset,
  TempSignUp,
} from './entities/dto/temp_signup.dto';
import { WorkSpaceTeamMateInvitations } from './entities/schema/work_space_invitation.schema';
import { SocketType } from './entities/types';
import Event from './entities/types/event';
import { INVITATION_STATUS } from './entities/types/invitation_status';
import JwtPayload from './entities/types/jwt.payload';
import {
  UserRepository,
  WidgetConfigRepository,
  WorkSpacePermissionsRepository,
  WorkSpaceTeamMatesRepository,
  WorkspaceRepository,
} from './repositories';
import { WorkSpaceDefaultsRepository } from './repositories/workspace_defaults.repository';
import { WorkSpaceInvitationRepository } from './repositories/workspace_teammate_invitations.repository';
import { get_complete_enabled_permisions } from './utilities';

@Injectable()
export class AuthService {
  constructor(
    private user_repository: UserRepository,
    private workspace_repository: WorkspaceRepository,
    private workspace_team_mates_repository: WorkSpaceTeamMatesRepository,
    private workspace_permissions_repository: WorkSpacePermissionsRepository,
    private widget_config_repository: WidgetConfigRepository,
    private workspace_defaults_repository: WorkSpaceDefaultsRepository,
    private messages_repository: MessagesRepository,
    private conversations_repository: ConversationsRepository,
    private workspace_invitation_repository: WorkSpaceInvitationRepository,
    @InjectModel(WidgetConfig.name)
    private widgetConfigModel: Model<WidgetConfig>,
    private config: ConfigService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private gmailService: GmailEmailService,
    private email_service: EmailService,
    private error_handling_service: ErrorHandlingService,
  ) {}
  async signup(dto: SignUpDto, res: Response) {
    // check if agent account with that email exists

    const result = await this.user_repository.check_exists({
      email: dto.email,
      type: USERTYPE.AGENT,
    });

    if (result)
      throw new HttpException(
        'user with that account already exists',
        HttpStatus.CONFLICT,
      );
    const invitation = await this.workspace_invitation_repository.get_one({
      email: dto.email,
    });
    const createdUser = await this.user_repository.create({
      ...dto,
      type: USERTYPE.AGENT,
      verified: invitation ? true : false,
    });

    createdUser.password = await this.encryptpassword(createdUser.password);
    const userResult = await this.user_repository.update_current(createdUser);
    if (userResult.verification_code) {
      //verification_url
      const html_to_send = await read_html_file(
        path.join(
          process.cwd(),
          './src/email/assets/templates/email_verification.html',
        ),
        {
          verification_url: `${this.config.get(
            'BASE_URL',
          )}/verification/email-verification/${userResult.verification_code}`,
          username: userResult.user_name,
        },
      );

      await this.email_service.send_email({
        to: userResult.email,
        subject: 'Verify your email on SparkHub',
        html: html_to_send,
        namespace: 'SparkHub',
      });
    }
    // create workspace
    const workspace = await this.workspace_repository.create({
      company_name: dto.company_name,
      company_size: dto.company_size,
      created_by: userResult._id,
      is_default: true,
    });
    const workspace_team_mate =
      await this.workspace_team_mates_repository.create({
        user: userResult._id,
        workspace: workspace._id,
      });
    const workspace_permissions =
      await this.workspace_permissions_repository.create({
        team_mate: workspace_team_mate._id,
        ...get_complete_enabled_permisions(),
      });
    await this.workspace_defaults_repository.create({
      workspace: workspace._id,
      _id: userResult._id,
    });
    return this.create_signin_response({
      status_code: 201,
      user: userResult,
      res,
      msg: 'Successfully signed up.',
      workspaces: [workspace],
      active_workspace: { permissions: workspace_permissions, workspace },
    });
  }

  async join_active_workspace(client: SocketType) {
    if (client.user.session_id) {
      const current_session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      if (current_session) {
        // session exists
        if (current_session.active_workspace) {
          // has active workspace
          //join client to active workspace
          client.join(current_session.active_workspace);
        }
      }
    }
  }
  async forgot_password(req: Request<null, undefined, ForgotPassword>) {
    const { email } = req.body;
    const user = await this.user_repository.get_one({
      email,
    });
    if (user) {
      const token = sign(
        { id: user._id },
        this.config.get('ACCESS_TOKEN_SECRET'),
        {
          expiresIn: '1h',
        },
      );

      await this.gmailService.sendEmail({
        to: email,
        subject: 'Forgot Password',
        text: `Click on this link to reset your password: ${req.headers.origin}/reset-password?token=${token}`,
        namespace: 'SparkHub',
      });
      return {
        message:
          'An email has been sent to your email address. Please check your email to reset your password.',
      };
    }
    throw new HttpException('user not found', HttpStatus.NOT_FOUND);
  }

  async reset_password({ password, token }: PasswordReset) {
    try {
      const decoded = verify(token, this.config.get('ACCESS_TOKEN_SECRET'));
      const user = await this.user_repository.get_by_id(decoded['id']);
      if (user) {
        user.password = await this.encryptpassword(password);
        await this.user_repository.update_current(user);
        return {
          message: 'Password reset successfully',
        };
      }
    } catch (error) {}
    throw new HttpException('user not found', HttpStatus.NOT_FOUND);
  }

  private generate_html_to_send = async (
    invite_id: string,
    teammate_name: string,
    team_name: string,
  ) => {
    return read_html_file(
      path.join(
        process.cwd(),
        './src/email/assets/templates/teammate_invite.html',
      ),
      {
        teammate_name,
        team_name,
        join_url: `${this.config.get('BASE_URL')}/teams/join/${invite_id}`,
      },
    );
  };

  async handle_send_invite(client: SocketType, payload: InviteTeamMatesDto) {
    try {
      const current_user = await this.user_repository.get_by_id(
        client.user.sub,
      );

      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      const active_workspace = await this.workspace_repository.get_by_id(
        session.active_workspace,
      );

      const generate_html_to_send = async (invite_id: string) => {
        return read_html_file(
          path.join(
            process.cwd(),
            './src/email/assets/templates/teammate_invite.html',
          ),
          {
            teammate_name: current_user.user_name,
            team_name: active_workspace.company_name,
            join_url: `${this.config.get('BASE_URL')}/teams/join/${invite_id}`,
          },
        );
      };

      const invitations: WorkSpaceTeamMateInvitations[] = [];
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);
      const cleaned_emails = payload.emails.filter((email) => {
        const validatedEmail = validate_email(email);

        if (!validatedEmail) {
          this.error_handling_service.emitErrorEventToDashboard(
            active_workspace.id,
            ERROR_MESSAGES.INVALID_EMAIL + email,
          );
        }

        return validatedEmail;
      });
      if (cleaned_emails.length) {
        for (const email of cleaned_emails) {
          const foundUser = await this.user_repository.get_one({
            email,
          });

          if (foundUser) {
            const teamExists =
              await this.workspace_team_mates_repository.get_one({
                workspace: new mongoose.Types.ObjectId(active_workspace as any),
                user: new mongoose.Types.ObjectId(foundUser._id),
              });

            if (teamExists) {
              return {
                invitations: null,
                status: 400,
                error: `${foundUser.email} is already part of workspace ${active_workspace.company_name}`,
              };
            }
          }
          const invitationExists =
            await this.workspace_invitation_repository.check_exists({
              workspace: active_workspace._id,
              email: email.toLowerCase(),
              status: INVITATION_STATUS.PENDING,
            });

          if (!invitationExists) {
            const invitation =
              await this.workspace_invitation_repository.create({
                workspace: active_workspace._id,
                email: email.toLowerCase(),
                inviter: current_user._id,
                expiry_date: expires,
                status: INVITATION_STATUS.PENDING,
              });
            const html_To_send = await generate_html_to_send(invitation.id);
            await this.email_service.send_email({
              to: email,
              subject: 'Invitation to Join a Team on SparkHub',
              html: html_To_send,
              namespace: 'SparkHub',
            });

            invitations.push(invitation);
          } else {
            return {
              invitations: null,
              status: 400,
              error: ERROR_MESSAGES.INVITATION_CONFLICT,
            };
          }
        }

        return { invitations, status: 200, error: null };
      } else {
        this.error_handling_service.emitErrorEventToDashboard(
          active_workspace.id,
          ERROR_MESSAGES.NO_VALID_EMAIL,
        );

        return {
          invitations,
          status: 401,
          error: ERROR_MESSAGES.NO_VALID_EMAIL,
        };
      }
    } catch (e: any) {
      return {
        invitations: null,
        status: 500,
        error: 'internal server error',
      };
    }
  }

  async handle_resend_invite(
    client: SocketType,
    payload: ResendInviteTeamMateDto,
  ) {
    try {
      const current_user = await this.user_repository.get_by_id(
        client.user.sub,
      );
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      const active_workspace = await this.workspace_repository.get_by_id(
        session.active_workspace,
      );

      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);

      const invitationExists =
        await this.workspace_invitation_repository.check_exists({
          email: payload.email.toLowerCase(),
        });

      if (invitationExists) {
        // Send email to user to join workspace
        const html_To_send = await this.generate_html_to_send(
          invitationExists._id,
          current_user.user_name,
          active_workspace.company_name,
        );
        await this.email_service.send_email({
          to: payload.email.toLowerCase(),
          subject: 'Invitation to Join a Team on SparkHub',
          html: html_To_send,
          namespace: 'SparkHub',
        });
      } else {
        return {
          status: 400,
          error: "Invitation doesn't exist",
        };
      }

      return { status: 200, error: null };
    } catch (error) {
      return {
        error: 'internal server error',
        status: 500,
      };
    }
  }

  async handle_delete_invite(payload: CheckInviteTeamMatesDto) {
    try {
      const invitationExists =
        await this.workspace_invitation_repository.check_exists({
          _id: payload.invite_id,
        });

      if (invitationExists) {
        const invite = await this.workspace_invitation_repository.delete_one({
          _id: payload.invite_id,
        });

        return { status: 200, error: null, data: invite };
      } else {
        return {
          status: 400,
          error: "Invitation doesn't exist",
        };
      }
    } catch (error) {
      return {
        error: 'internal server error',
        status: 500,
      };
    }
  }

  async handle_get_invites(client: SocketType) {
    try {
      const current_session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      const results = await this.workspace_invitation_repository.get_all({
        workspace: new mongoose.Types.ObjectId(
          current_session.active_workspace,
        ),
        status: INVITATION_STATUS.PENDING,
      });
      return { error: null, data: results };
    } catch (e: any) {
      return { error: 'internal server error', data: null, status: 500 };
    }
  }

  async handle_get_team_mates(client: SocketType) {
    try {
      const current_session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      const results = await this.workspace_team_mates_repository.get_all({
        workspace: new mongoose.Types.ObjectId(
          current_session.active_workspace,
        ),
      });
      return { error: null, data: results };
    } catch (e: any) {
      return { error: 'internal server error', data: null, status: 500 };
    }
  }
  async handle_verification(client: SocketType, payload: EmailVerificationDto) {
    const user = await this.user_repository.get_by_id(client.user.sub);
    if (user) {
      if (!user.verified) {
        if (user.verification_code === payload.code) {
          user.verified = true;
          await user.save();
          return { error: 'Email verified', status: 200, data: user };
        } else {
          return {
            error: 'Invalid verification code',
            status: 401,
            data: user,
          };
        }
      } else {
        return { error: 'User Already verified', status: 200, data: user };
      }
    } else {
      return { error: 'User not found', status: 404, data: null };
    }
  }
  async handle_send_verification_email(client: SocketType) {
    try {
      const current_user = await this.user_repository.get_by_id(
        client.user.sub,
      );
      if (current_user.verification_code) {
        //verification_url
        const html_to_send = await read_html_file(
          path.join(
            process.cwd(),
            './src/email/assets/templates/email_verification.html',
          ),
          {
            verification_url: `${this.config.get(
              'BASE_URL',
            )}/verification/email-verification/${
              current_user.verification_code
            }`,
            username: current_user.user_name,
          },
        );

        await this.email_service.send_email({
          to: current_user.email,
          subject: 'Verify your email on SparkHub',
          html: html_to_send,
          namespace: 'SparkHub',
        });
        return { error: null, status: 200, data: current_user };
      }
      return { error: 'User account error', status: 401, data: current_user };
    } catch (e: any) {
      return {
        error: 'Internal server error',
        status: 500,
        data: null,
      };
    }
  }
  async handle_check_invite(
    client: SocketType,
    payload: CheckInviteTeamMatesDto,
  ) {
    try {
      const invitation = await this.workspace_invitation_repository.get_by_id(
        payload.invite_id,
      );

      if (invitation) {
        const invitedUser = await this.user_repository.get_one({
          email: invitation.email,
        });

        if (!invitedUser) {
          return {
            error: 'Account not found',
            status: 410,
          };
        }

        const result = await this.workspace_team_mates_repository.get_one({
          user: new mongoose.Types.ObjectId(invitedUser._id),
          workspace: invitation.workspace._id,
        });
        if (result) {
          return {
            invitation: {
              ...invitation.toObject(),
              status: INVITATION_STATUS.ACCEPTED,
            },
            status: 200,
            error: null,
          };
        }
        return {
          invitation: {
            ...invitation.toObject(),
            status:
              invitation.expiry_date < new Date()
                ? INVITATION_STATUS.EXPIRED
                : invitation.status,
          },
          status: 200,
          error: null,
        };
      } else {
        return {
          invitation: null,
          status: 404,
          error: 'invitation not found',
        };
      }
    } catch (e: any) {
      return {
        invitations: null,
        status: 500,
        error: 'internal server error',
      };
    }
  }

  async handle_join_team(client: SocketType, payload: CheckInviteTeamMatesDto) {
    try {
      const invitation = await this.workspace_invitation_repository.get_one({
        _id: new mongoose.Types.ObjectId(payload.invite_id),
      });
      if (invitation) {
        const userByEmail = await this.user_repository.get_one({
          email: invitation.email,
        });

        if (!userByEmail) {
          return {
            error: 'Account not found',
            status: 410,
          };
        }

        const result = await this.workspace_team_mates_repository.get_one({
          user: new mongoose.Types.ObjectId(userByEmail._id),
          workspace: invitation.workspace._id,
        });

        if (result) {
          return {
            error: 'You are already part of this workspace',
            status: 409,
          };
        } else {
          return this.join_workspace(userByEmail, invitation, client);
        }
      } else {
        return { error: 'Invitation not found', status: 404 };
      }
    } catch (e: any) {
      return { error: 'Internal server error', status: 500 };
    }
  }

  async join_workspace(
    invitedUser: Users,
    invitation: WorkSpaceTeamMateInvitations,
    client: SocketType,
  ) {
    try {
      const workspace_team_mate =
        await this.workspace_team_mates_repository.create({
          user: new mongoose.Types.ObjectId(invitedUser._id),
          workspace: invitation.workspace,
        });
      await this.workspace_invitation_repository.update_one_by_id(
        invitation._id,
        {
          $set: {
            status: INVITATION_STATUS.ACCEPTED,
          },
        },
      );

      const workspace_permissions =
        await this.workspace_permissions_repository.create({
          team_mate: workspace_team_mate._id,
          ...get_complete_enabled_permisions(),
        });

      // update session
      const current_session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      current_session.active_workspace = invitation.workspace.id;
      const updated_session = await this.redisService.create_session(
        client.user.sub,
        client.user.session_id,
        current_session,
      );

      return {
        error: null,
        status: 200,
        data: {
          workspace: invitation.workspace,
          workspace_permissions,
          session: updated_session,
        },
      };
    } catch (e: any) {
      return {
        error: 'Internal server error',
        status: 500,
      };
    }
    // create new team mate here
    // update invitation status
    // change active workspace
  }

  async remove_team_mate_from_workspace(payload: DeleteTeamMatesDto) {
    try {
      // TODO: check if user has permissions to delete team mate
      const userExists = await this.user_repository.check_exists({
        _id: payload.userId,
      });

      if (userExists) {
        const user = await this.workspace_team_mates_repository.delete_one({
          user: new mongoose.Types.ObjectId(payload.userId),
        });

        return {
          error: null,
          status: 200,
          data: user,
        };
      } else {
        return { error: 'User not found', status: 404, data: null };
      }
    } catch (e: any) {
      return { error: 'Internal server error', status: 500 };
    }
  }

  async temp_signup(payload: TempSignUp, res: Response) {
    // find root account
    const config = await this.widget_config_repository.get_by_id(
      payload.widget_id,
    );
    if (config && config.workspace) {
      const createdUser = await this.user_repository.create({
        email: null,
        user_name: 'Anonymous',
        workspace: (config.workspace as WorkSpaces)._id,
        contact_type: CONTACT_TYPE.LEAD,
      });
      res.cookie(COOKIES.CLIENT_AUTH, createdUser.id, {
        httpOnly: true,
        secure: this.config.get('NODE_ENV') === 'production',
        signed: true,
      });

      return createdUser;
    } else {
      // widget not found

      throw new HttpException('widget_config not found', HttpStatus.NOT_FOUND);
    }
    // create temp user
  }
  async handle_delete_workspace(id: string, user: JwtPayload) {
    // check if workspace exists and current user is part of it
    const team_mate = await this.workspace_team_mates_repository.get_one({
      workspace: { _id: new mongoose.Types.ObjectId(id) },
      user: {
        _id: new mongoose.Types.ObjectId(user.sub),
      },
    });

    if (!team_mate)
      throw new HttpException(
        'user not part of workspace',
        HttpStatus.FORBIDDEN,
      );
    // TODO: check if user has permissions to delete workspace
    if (user.sub !== team_mate.workspace.created_by.id)
      throw new HttpException(
        'you did not create this workspace',
        HttpStatus.FORBIDDEN,
      );

    return this.process_delete_workspace(id, user);
  }
  async handle_socket_change_active_workspace_data(
    client: SocketType,
    payload: ChangeWorkSpaceDto,
  ) {
    const user = await this.user_repository.get_by_id(client.user.sub);
    const { workspaces, workspaces_set, workspaces_map } =
      await this.get_all_user_workspaces(user);
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    if (session.active_workspace) {
      // default workspace set

      if (workspaces_map.has(payload.workspace._id)) {
        // set active workspace
        const result = await this.redisService.create_session(
          client.user.sub,
          client.user.session_id,
          {
            refresh_token: session.refresh_token,
            active_workspace: payload.workspace._id,
          },
        );
        client.join(payload.workspace._id);
        client.leave(session.active_workspace);
        const user_team_mate =
          await this.workspace_team_mates_repository.get_one({
            user: user._id,
            workspace: workspaces_map.get(payload.workspace._id).workspace._id,
          });
        const permission_results =
          await this.workspace_permissions_repository.get_one({
            team_mate: user_team_mate._id,
          });
        if (permission_results) {
          // permissions = permission_results;

          return {
            data: {
              workspaces: workspaces as WorkSpaces[],
              active_workspace: {
                permissions: permission_results,
                workspace: workspaces_map.get(payload.workspace._id).workspace,
              },
              user,
            },
            error: null,
          };
        } else {
          return {
            data: null,
            error: { msg: 'no permissions found', status: 404 },
          };
        }
      } else {
        return {
          data: null,
          error: { msg: 'workspace not found', status: 404 },
        };
      }
    } else {
      return {
        data: null,
        error: { msg: 'session does not exist', status: 404 },
      };
    }
  }
  async handle_change_active_workspace_data(
    userJwt: JwtPayload,
    payload: ChangeWorkSpaceDto,
    res: Response,
  ) {
    const user = await this.user_repository.get_by_id(userJwt.sub);
    const { workspaces, workspaces_set, workspaces_map } =
      await this.get_all_user_workspaces(user);
    const session = await this.redisService.get_session(
      userJwt.sub,
      userJwt.session_id,
    );
    if (session.active_workspace) {
      // default workspace set

      if (workspaces_map.has(payload.workspace._id)) {
        // set active workspace

        const result = await this.redisService.create_session(
          userJwt.sub,
          userJwt.session_id,
          {
            refresh_token: session.refresh_token,
            active_workspace: payload.workspace._id,
          },
        );

        const user_team_mate =
          await this.workspace_team_mates_repository.get_one({
            user: user._id,
            workspace: workspaces_map.get(payload.workspace._id).workspace._id,
          });
        const permission_results =
          await this.workspace_permissions_repository.get_one({
            team_mate: user_team_mate._id,
          });
        if (permission_results) {
          // permissions = permission_results;

          return this.create_signin_response({
            status_code: 200,
            user,
            res,
            msg: 'Successfully Switched active workspace.',
            workspaces: workspaces as WorkSpaces[],
            active_workspace: {
              permissions: permission_results,
              workspace: workspaces_map.get(payload.workspace._id).workspace,
            },
          });
        } else {
          throw new HttpException(
            'no permissions found!',
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        throw new HttpException('workspace not found!', HttpStatus.NOT_FOUND);
      }
    } else {
      throw new HttpException('session does not exist', HttpStatus.NOT_FOUND);
    }
  }
  async get_all_user_workspaces(user: Users): Promise<{
    workspaces: WorkSpaces[];
    workspaces_set: Set<WorkSpaces>;
    workspaces_map: Map<
      string,
      { workspace: WorkSpaces; team_mate: WorkSpaceTeamMates }
    >;
  }> {
    const user_team_mate_accounts =
      await this.workspace_team_mates_repository.get_all({
        user: user._id,
      });
    const workspaces_set = new Set<WorkSpaces>();
    const workspaces_map = new Map<
      string,
      { workspace: WorkSpaces; team_mate: WorkSpaceTeamMates }
    >();
    user_team_mate_accounts.forEach((item) => {
      workspaces_set.add(item.workspace);
      workspaces_map.set(item.workspace.id, {
        workspace: item.workspace,
        team_mate: item,
      });
    });
    const workspaces: WorkSpaces[] = [];
    workspaces_set.forEach((item) => {
      workspaces.push(item);
    });
    return { workspaces, workspaces_map, workspaces_set };
  }
  async login(dto: LoginDto, res: Response) {
    // check if password is correct if so sign tokens and return
    const user = await this.user_repository.get_one({
      email: dto.email,
    });

    if (!user || !user.password)
      throw new HttpException(
        'that account does not exist',
        HttpStatus.NOT_FOUND,
      );

    const matches = await bcrypt.compare(dto.password, user.password);

    if (!matches)
      throw new HttpException('Incorrect credentials', HttpStatus.FORBIDDEN);

    // get all workspaces the user is part of

    const { workspaces, workspaces_set, workspaces_map } =
      await this.get_all_user_workspaces(user);

    let active_workspace: WorkSpaces = null;
    let permissions = null;
    if (workspaces.length < 1) {
      await this.workspace_defaults_repository.update_one(
        { id: user.id },
        {
          workspace: null,
        },
      );
    } else {
      // find default workspace
      const default_workspace =
        await this.workspace_defaults_repository.get_by_id(user.id);
      if (default_workspace) {
        if (default_workspace.workspace) {
          // default workspace set

          if (
            workspaces_map.has((default_workspace.workspace as WorkSpaces).id)
          ) {
            active_workspace = default_workspace.workspace as WorkSpaces;
            const user_team_mate =
              await this.workspace_team_mates_repository.get_one({
                user: user._id,
                workspace: active_workspace._id,
              });
            const permission_results =
              await this.workspace_permissions_repository.get_one({
                team_mate: user_team_mate._id,
              });
            if (permission_results) {
              permissions = permission_results;
            } else {
              throw new HttpException(
                'no permissions found!',
                HttpStatus.NOT_FOUND,
              );
            }
          } else {
            // invalid workspace
            if (workspaces.length > 0) {
              // has atleast one work space available
              const temp_workspace = workspaces[0];

              await this.workspace_defaults_repository.update_one(
                { id: user.id },
                {
                  workspace: temp_workspace._id,
                },
              );
              active_workspace = temp_workspace;
              const user_team_mate =
                await this.workspace_team_mates_repository.get_one({
                  user: user._id,
                  workspace: active_workspace._id,
                });
              const permission_results =
                await this.workspace_permissions_repository.get_one({
                  team_mate: user_team_mate._id,
                });
              if (permission_results) {
                permissions = permission_results;
              } else {
                throw new HttpException(
                  'no permissions found!',
                  HttpStatus.NOT_FOUND,
                );
              }
            } else {
              await this.workspace_defaults_repository.update_one(
                { id: user.id },
                {
                  workspace: null,
                },
              );
            }
          }
        } else {
          // no default workspace set
          if (workspaces.length > 0) {
            // has atleast one work space available
            const temp_workspace = workspaces[0];

            await this.workspace_defaults_repository.update_one(
              { id: user.id },
              {
                workspace: temp_workspace._id,
              },
            );
            active_workspace = temp_workspace;
            const user_team_mate =
              await this.workspace_team_mates_repository.get_one({
                user: user._id,
                workspace: active_workspace._id,
              });
            const permission_results =
              await this.workspace_permissions_repository.get_one({
                team_mate: user_team_mate.id,
              });
            if (permission_results) {
              permissions = permission_results;
            } else {
              throw new HttpException(
                'no permissions found!',
                HttpStatus.NOT_FOUND,
              );
            }
          }
        }
      } else {
        await this.workspace_defaults_repository.create({
          _id: user._id,
          workspace: null,
        });
      }
    }

    return this.create_signin_response({
      status_code: 200,
      user,
      res,
      msg: 'Successfully logged in.',
      workspaces: workspaces as WorkSpaces[],
      active_workspace: {
        permissions,
        workspace: active_workspace,
      },
    });
  }

  async socialLogin(dto: SocialLoginDto, res: Response) {
    // check if password is correct if so sign tokens and return

    const user = await this.user_repository.get_one({
      email: dto.email,
    });

    if (!user)
      throw new HttpException(
        'that account does not exist',
        HttpStatus.NOT_FOUND,
      );

    // get all workspaces the user is part of

    const { workspaces, workspaces_map } = await this.get_all_user_workspaces(
      user,
    );

    let active_workspace: WorkSpaces = null;
    let permissions = null;
    if (workspaces.length < 1) {
      await this.workspace_defaults_repository.update_one(
        { id: user.id },
        {
          workspace: null,
        },
      );
    } else {
      // find default workspace
      const default_workspace =
        await this.workspace_defaults_repository.get_by_id(user.id);
      if (default_workspace) {
        if (default_workspace.workspace) {
          // default workspace set

          if (
            workspaces_map.has((default_workspace.workspace as WorkSpaces).id)
          ) {
            active_workspace = default_workspace.workspace as WorkSpaces;
            const user_team_mate =
              await this.workspace_team_mates_repository.get_one({
                user: user._id,
                workspace: active_workspace._id,
              });
            const permission_results =
              await this.workspace_permissions_repository.get_one({
                team_mate: user_team_mate._id,
              });
            if (permission_results) {
              permissions = permission_results;
            } else {
              throw new HttpException(
                'no permissions found!',
                HttpStatus.NOT_FOUND,
              );
            }
          } else {
            // invalid workspace
            if (workspaces.length > 0) {
              // has atleast one work space available
              const temp_workspace = workspaces[0];

              await this.workspace_defaults_repository.update_one(
                { id: user.id },
                {
                  workspace: temp_workspace._id,
                },
              );
              active_workspace = temp_workspace;
              const user_team_mate =
                await this.workspace_team_mates_repository.get_one({
                  user: user._id,
                  workspace: active_workspace._id,
                });
              const permission_results =
                await this.workspace_permissions_repository.get_one({
                  team_mate: user_team_mate._id,
                });
              if (permission_results) {
                permissions = permission_results;
              } else {
                throw new HttpException(
                  'no permissions found!',
                  HttpStatus.NOT_FOUND,
                );
              }
            } else {
              await this.workspace_defaults_repository.update_one(
                { id: user.id },
                {
                  workspace: null,
                },
              );
            }
          }
        } else {
          // no default workspace set
          if (workspaces.length > 0) {
            // has atleast one work space available
            const temp_workspace = workspaces[0];

            await this.workspace_defaults_repository.update_one(
              { id: user.id },
              {
                workspace: temp_workspace._id,
              },
            );
            active_workspace = temp_workspace;
            const user_team_mate =
              await this.workspace_team_mates_repository.get_one({
                user: user._id,
                workspace: active_workspace._id,
              });
            const permission_results =
              await this.workspace_permissions_repository.get_one({
                team_mate: user_team_mate.id,
              });
            if (permission_results) {
              permissions = permission_results;
            } else {
              throw new HttpException(
                'no permissions found!',
                HttpStatus.NOT_FOUND,
              );
            }
          }
        }
      } else {
        await this.workspace_defaults_repository.create({
          _id: user._id,
          workspace: null,
        });
      }
    }

    return this.create_signin_response({
      status_code: 200,
      user,
      res,
      msg: 'Successfully logged in.',
      workspaces: workspaces as WorkSpaces[],
      active_workspace: {
        permissions,
        workspace: active_workspace,
      },
    });
  }

  async refreshtoken(req: Request, res: Response) {
    const refreshToken = req.signedCookies[COOKIES.AUTH];
    if (!refreshToken)
      throw new HttpException(
        'invalid token or expired or empty token provided.',
        HttpStatus.FORBIDDEN,
      );
    try {
      const result = await this.verifyRefreshToken(refreshToken);
      const userId = result.sub;
      const session_id = result.session_id;

      const session = await this.redisService.get_session(userId, session_id);

      if (session) {
        if (session.refresh_token !== refreshToken)
          throw new HttpException(
            'invalid or expired refresh token.',
            HttpStatus.FORBIDDEN,
          );
        const user = await this.user_repository.get_by_id(userId);
        if (!user)
          throw new HttpException('user not found', HttpStatus.NOT_FOUND);
        const { workspaces, workspaces_map } =
          await this.get_all_user_workspaces(user);
        let active_workspace;
        let permissions;
        if (session.active_workspace) {
          // no active workspace -> set active workspace
          if (workspaces_map.has(session.active_workspace)) {
            const workspace_info = workspaces_map.get(session.active_workspace);

            active_workspace = workspace_info.workspace;
            permissions = await this.workspace_permissions_repository.get_one({
              team_mate: workspace_info.team_mate._id,
            });
            if (!permissions)
              throw new HttpException(
                'permissions not found',
                HttpStatus.NOT_FOUND,
              );
          } else {
            // active workspace not fetched - > so lets fetch it
            const active_workspace = await this.workspace_repository.get_by_id(
              session.active_workspace,
            );
            // if (!active_workspace)
            //   throw new HttpException(
            //     'active workspace not found!',
            //     HttpStatus.NOT_FOUND,
            //   );
            if (active_workspace) {
              const team_mate =
                await this.workspace_team_mates_repository.get_one({
                  workspace: active_workspace?._id,
                  user: user._id,
                });
              if (team_mate)
                permissions =
                  await this.workspace_permissions_repository.get_one({
                    team_mate: team_mate._id,
                  });
            }
          }
        } else {
          // no active workspace -> set active workspace
          if (workspaces.length > 0) {
            // has atleast one workspace
            active_workspace = workspaces[0];
            await this.workspace_defaults_repository.update_one(
              { id: user.id },
              {
                workspace: active_workspace._id,
              },
            );
          }
        }
        return this.create_refreshtoken_response({
          status_code: 200,
          user,
          res,
          session_id,
          msg: 'Refreshed token successfully.',
          workspaces: workspaces,
          active_workspace: {
            permissions,
            workspace: active_workspace,
          },
        });
      } else {
        throw new HttpException('expired session', HttpStatus.FORBIDDEN);
      }
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          'invalid or expired refresh token.',
          HttpStatus.FORBIDDEN,
        );
      }
    }
  }

  async set_status_online(id: string, session_user: SocketType) {
    return this.redisService.set_status_online(id, session_user);
  }
  async set_status_offline(id: string) {
    return this.redisService.set_status_offline(id);
  }
  async current_server_set_status_offline(id: string, socket_id: string) {
    return this.redisService.current_server_set_status_offline(id, socket_id);
  }
  async current_server_set_status_online(
    id: string,
    socket_id: string,
    session_user: SocketType,
  ) {
    // await this.redisService.client.del(
    //   '[online_status]:6297838c6672bead5593d6e8',
    // );
    return this.redisService.current_server_set_status_online(
      id,
      socket_id,
      session_user,
    );
  }
  async current_server_check_is_online(id: string) {
    return this.redisService.current_server_check_is_online(id);
  }
  async check_is_online(id: string) {
    return this.redisService.check_is_online(id);
  }
  async get_user_session_size(id: string) {
    return this.redisService.get_user_session_size(id);
  }
  async add_current_server_online_user(
    id: string,
    socket_id: string,
    session_user: SocketType,
  ) {
    return this.redisService.add_current_server_online_user(
      id,
      socket_id,
      session_user,
    );
  }
  async remove_current_server_online_user(id: string) {
    return this.redisService.remove_current_server_online_user(id);
  }
  async logout(req: Request, res: Response) {
    const refreshToken = req.signedCookies[COOKIES.AUTH];
    if (!refreshToken)
      throw new HttpException(
        'invalid or expired token.',
        HttpStatus.FORBIDDEN,
      );
    try {
      const result = await this.verifyRefreshToken(refreshToken);
      const session_id = result.session_id;
      const delete_session_result = await this.redisService.delete_session(
        result.sub,
        session_id,
      );

      // await this.redisService.delete_all_sessions(result.sub)
      this.deleteClientEventQueueWithSessionId(session_id);

      res.clearCookie(COOKIES.AUTH);
      return { statusCode: 200, message: 'successfully logged out.' };
    } catch (e) {
      throw new HttpException(
        'invalid or expired refresh token.',
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async verifyAndUpdateSocketToken(client: SocketType, event: Event) {
    const data = event.data;
    try {
      const token_data = await this.verifyAccessToken(data.access_token);
      client.user = {
        ...token_data,
        token: data.access_token,
        type: USERTYPE.AGENT,
      };

      await this.ExecuteQueuedEvents(client);
    } catch (e) {
      client.emit('refresh_token_error', { msg: 'Forbidden' });
    }
  }

  async queueEvent(client: SocketType, event: Event): Promise<void> {
    await this.redisService.PushList(`events:${client.user.session_id}`, event);
    const query = await this.redisService.getList(
      `events:${client.user.session_id}`,
      {},
    );
  }

  async deleteClientEventQueue(client: SocketType): Promise<void> {
    await this.redisService.delete(`events:${client.user.session_id}`);
    const query = await this.redisService.getList(
      `events:${client.user.session_id}`,
      {},
    );
  }
  async join_root_account_agents_room(client: SocketType) {
    const user_account = await this.user_repository.get_by_id(client.user.sub);
  }
  async deleteClientEventQueueWithSessionId(session_id: string) {
    await this.redisService.delete(`events:${session_id}`);
    const query = await this.redisService.getList(`events:${session_id}`, {});
  }
  async ExecuteQueuedEvents(client: SocketType) {
    const queued_events = await this.redisService.getList(
      `events:${client.user.session_id}`,
      {},
    );
    if (queued_events.size > 0) {
      client.emit('retry_events', queued_events);
    }
  }
  async signAccessToken(
    userId: string,
    email: string,
    session_id: string,
  ): Promise<string> {
    const payload = { sub: userId, email, session_id };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('ACCESS_TOKEN_SECRET_EXPIRATION'),
      secret: this.config.get('ACCESS_TOKEN_SECRET'),
    });
  }

  async signRefreshToken(
    userId: string,
    email: string,
    session_id: string,
  ): Promise<string> {
    const payload = { sub: userId, email, session_id };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('REFRESH_TOKEN_EXPIRATION'),
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
    });
  }
  async verifyRefreshToken(token: string) {
    const secret = this.config.get('REFRESH_TOKEN_SECRET');
    const options: JwtVerifyOptions = { secret };
    const result = this.jwtService.verifyAsync(token, options);
    return Promise.resolve(result);
  }

  async verifyAccessToken(token: string) {
    const secret = this.config.get('ACCESS_TOKEN_SECRET');
    const options: JwtVerifyOptions = { secret };
    const result = this.jwtService.verifyAsync(token, options);
    return Promise.resolve(result);
  }
  async encryptpassword(password: string) {
    const salt = await bcrypt.genSalt(
      Number(this.config.get('HASH_SALT_ROUNDS')),
    );
    return bcrypt.hash(password, salt);
  }

  async get_widget_config(user_payload: JwtPayload) {
    const user = await this.user_repository.get_one({
      email: user_payload.email,
    });
    const widget_config = await this.widgetConfigModel.findOne({ user });
    return widget_config;
  }
  async create_refreshtoken_response(payload: {
    status_code: number;
    user: Users;
    res: Response;
    session_id: string;
    msg: string;
    workspaces: WorkSpaces[];
    active_workspace: {
      permissions: WorkSpacePermissions;
      workspace: WorkSpaces;
    };
  }) {
    const access_token = await this.signAccessToken(
      payload.user.id,
      payload.user.email,
      payload.session_id,
    );
    const session_debug = await this.redisService.get_all_sessions(
      payload.user.id,
    );

    const user = await new DocumentTransformer().transformExclude(
      ['password', '__v', 'createdAt', 'is_root', 'updatedAt', 'sub_accounts'],
      payload.user,
    );
    user['access_token'] = access_token;
    return new EntityResponse(
      payload.status_code,
      {
        user,
        user_workspace_info: {
          workspaces: payload.workspaces,
          active_workspace: payload.active_workspace,
        },
      },
      payload.msg,
    );
  }

  async check_if_user_exists(id: string) {
    return this.user_repository.get_by_id(id);
  }

  async check_if_widget_exists(id: string) {
    return this.widget_config_repository.get_by_id(id);
  }
  // async set_new_session() {}
  async handle_socket_create_workspace(
    data: EventDto<WorkSpaceDto>,
    client: SocketType,
  ) {
    // get session
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    if (session) {
      // session found
      const result = await this.create_workspace(client.user.sub, {
        session_id: client.user.session_id,
        company_size: data.data.company_size,
        workspace_name: data.data.workspace_name,
      });
      if (result) {
        // get all workspaces
        return {
          error: null,
          data: result,
        };
      } else {
        return {
          error: { msg: 'could not create workspace', status: 500 },
          data,
        };
      }
    } else {
      //
      return { error: { msg: 'no session found', status: 404 }, data };
    }
  }
  async create_workspace(
    user_id: string,
    payload: {
      session_id: string;
      company_size: string;
      workspace_name: string;
    },
  ) {
    const workspace = await this.workspace_repository.create({
      company_name: payload.workspace_name,
      company_size: payload.company_size,
      created_by: new mongoose.Types.ObjectId(user_id),
    });
    const workspace_team_mate =
      await this.workspace_team_mates_repository.create({
        user: new mongoose.Types.ObjectId(user_id),
        workspace: workspace._id,
      });
    const workspace_permissions =
      await this.workspace_permissions_repository.create({
        team_mate: workspace_team_mate._id,
        ...get_complete_enabled_permisions(),
      });

    await this.create_spark_gpt_agent(workspace);

    // update session
    const current_session = await this.redisService.get_session(
      user_id,
      payload.session_id,
    );
    current_session.active_workspace = workspace.id;
    const updated_session = await this.redisService.create_session(
      user_id,
      payload.session_id,
      current_session,
    );

    return { workspace, workspace_permissions, session: updated_session };
  }

  async update_workspace(client: SocketType, payload: UpdateWorkSpaceDto) {
    try {
      const active_workspace = await this.redisService.get_active_workspace(
        client.user,
      );

      const workspace = await this.workspace_repository.update_one(
        { _id: new mongoose.Types.ObjectId(active_workspace) },
        {
          $set: {
            ...payload,
            company_name: payload.workspace_name,
          },
        },
      );

      return {
        data: workspace,
        error: null,
      };
    } catch {
      return {
        data: null,
        error: 'Something went wrong',
      };
    }
  }

  async create_signin_response(payload: {
    status_code: number;
    user: Users;
    res: Response;
    msg: string;
    workspaces: WorkSpaces[];
    active_workspace: {
      permissions: WorkSpacePermissions;
      workspace: WorkSpaces;
    };
  }) {
    const session_id = uuidv4();
    const refresh_token = await this.signRefreshToken(
      payload.user.id,
      payload.user.email,
      session_id,
    );
    const access_token = await this.signAccessToken(
      payload.user.id,
      payload.user.email,
      session_id,
    );

    await this.redisService.create_session(payload.user.id, session_id, {
      active_workspace: payload.active_workspace.workspace?.id
        ? payload.active_workspace.workspace.id
        : null,
      refresh_token,
    });
    const session_debug = await this.redisService.get_all_sessions(
      payload.user.id,
    );
    payload.res.cookie(COOKIES.AUTH, refresh_token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      signed: true,
    });

    const user = await new DocumentTransformer().transformExclude(
      ['password', '__v', 'createdAt', 'is_root', 'updatedAt', 'sub_accounts'],
      payload.user,
    );
    user['access_token'] = access_token;
    // user['workspaces'] = payload.workspaces;
    // user['active_workspace'] = payload.active_workspace;
    return new EntityResponse(
      payload.status_code,
      {
        user,
        user_workspace_info: {
          workspaces: payload.workspaces,
          active_workspace: payload.active_workspace,
        },
      },
      payload.msg,
    );
  }
  async updateLastSeen(client: SocketType) {
    try {
      const result = await this.user_repository.update_one(
        {
          _id: new mongoose.Types.ObjectId(
            client.user.user_id ? client.user.user_id : client.user.sub,
          ),
        },
        { last_seen: new Date() },
      );
      return result;
    } catch (e: any) {
      //...
    }
  }
  async process_delete_workspace(id: string, user: JwtPayload) {
    const session = await this.redisService.get_session(
      user.sub,
      user.session_id,
    );

    if (!session.active_workspace)
      throw new HttpException(
        'no active workspace found!',
        HttpStatus.NOT_FOUND,
      );
    const conversations = await this.conversations_repository.get_all({
      workspace: { _id: new mongoose.Types.ObjectId(id) },
    });

    // deleting workspace conversation messages
    await Promise.all(
      conversations.map(async (conversation) => {
        // delete their permissions
        await this.messages_repository.delete_many({
          conversation: conversation._id,
        });
      }),
    );
    // deleting workspace conversations
    await this.conversations_repository.delete_many({
      workspace: { _id: new mongoose.Types.ObjectId(id) },
    });
    //deleting widget config for workspace
    await this.widget_config_repository.delete_one({
      workspace: new mongoose.Types.ObjectId(id),
    });
    const team_mates = await this.workspace_team_mates_repository.get_all({
      workspace: { _id: new mongoose.Types.ObjectId(id) },
    });
    await Promise.all(
      team_mates.map(async (team_mate) => {
        // delete their permissions
        await this.workspace_permissions_repository.delete_one({
          team_mate: team_mate._id,
        });
      }),
    );
    // throw new Error('Function not implemented.');
    await this.workspace_team_mates_repository.delete_many({
      workspace: { _id: new mongoose.Types.ObjectId(id) },
    });

    const default_workspace =
      await this.workspace_defaults_repository.get_by_id(user.sub);
    const user_result = await this.user_repository.get_by_id(user.sub);
    await this.workspace_repository.delete_by_id(id);
    const { workspaces, workspaces_set, workspaces_map } =
      await this.get_all_user_workspaces(user_result);
    let active_workspace = null;
    let permissions = null;

    if ((default_workspace?.workspace as WorkSpaces).id === id) {
      // switch the active workspace

      if (workspaces.length > 0) {
        // has atleast one work space available

        const temp_workspace = workspaces[0];

        const result = await this.workspace_defaults_repository.update_one(
          { _id: new mongoose.Types.ObjectId(user.sub) },
          {
            workspace: temp_workspace._id,
          },
        );
        active_workspace = temp_workspace;
        const user_team_mate =
          await this.workspace_team_mates_repository.get_one({
            user: new mongoose.Types.ObjectId(user.sub),
            workspace: active_workspace._id,
          });
        const permission_results =
          await this.workspace_permissions_repository.get_one({
            team_mate: user_team_mate._id,
          });
        if (permission_results) {
          permissions = permission_results;
        } else {
          //...
        }
      } else {
        await this.workspace_defaults_repository.update_one(
          { _id: new mongoose.Types.ObjectId(user.sub) },
          {
            workspace: null,
          },
        );
      }

      const update_result = await this.redisService.create_session(
        user.sub,
        user.session_id,
        {
          refresh_token: session.refresh_token,
          active_workspace: active_workspace.id,
        },
      );

      return {
        msg: 'deleted workspace',
        status: 200,
        data: {
          active_workspace,
          workspaces,
        },
      };
    } else {
      let active_workspace = null;
      let permissions = null;

      if (session.active_workspace === id) {
        if (workspaces.length > 0) {
          // has atleast one work space available

          const temp_workspace = workspaces_map.get(
            (default_workspace.workspace as WorkSpaces).id,
          );
          active_workspace = temp_workspace.workspace;

          const user_team_mate =
            await this.workspace_team_mates_repository.get_one({
              user: new mongoose.Types.ObjectId(user.sub),
              workspace: active_workspace._id,
            });

          const permission_results =
            await this.workspace_permissions_repository.get_one({
              team_mate: user_team_mate._id,
            });
          if (permission_results) {
            permissions = permission_results;
          } else {
            throw new HttpException(
              'no permissions found!',
              HttpStatus.NOT_FOUND,
            );
          }
        } else {
          await this.workspace_defaults_repository.update_one(
            { _id: new mongoose.Types.ObjectId(user.sub) },
            {
              workspace: null,
            },
          );
        }
      } else {
        throw new HttpException(
          'workspace id provided not active workspace',
          HttpStatus.EXPECTATION_FAILED,
        );
      }
      const update_result = await this.redisService.create_session(
        user.sub,
        user.session_id,
        {
          refresh_token: session.refresh_token,
          active_workspace: active_workspace
            ? active_workspace.id
            : active_workspace,
        },
      );

      // const session_result = await this.redisService.get_session(
      //   user.sub,
      //   user.session_id,
      // );

      return {
        msg: 'deleted workspace',
        status: 200,
        data: {
          active_workspace: { workspace: active_workspace, permissions },
          workspaces,
        },
      };
    }
  }

  async create_spark_gpt_agent(workspace: WorkSpaces) {
    const spark_gpt_agent = await this.user_repository.create({
      user_name: 'Sparky - ' + workspace.company_name,
      workspace: workspace,
      type: USERTYPE.AGENT,
      company_name: workspace.company_name,
      verified: true,
    });

    await this.workspace_repository.update_one_by_id(workspace._id, {
      spark_gpt_agent: spark_gpt_agent._id,
    });

    return spark_gpt_agent;
  }
}
