import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Server } from 'socket.io';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import {
  ActivityLogAction,
  ActivityLogType,
} from 'src/activity-logs/entities/activity-log.entity';
import { AuthService } from 'src/auth/auth.service';
import { USERTYPE, Users, WidgetConfig, WorkSpaces } from 'src/auth/entities';
import { SocketType, User } from 'src/auth/entities/types';
import {
  UserRepository,
  WidgetConfigRepository,
  WorkspaceRepository,
} from 'src/auth/repositories';
import { get_online_prescence_room_name } from 'src/auth/utilities';
import { EmailService } from 'src/email/email.service';
import { ERROR_MESSAGES } from 'src/error-handling/constants';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import { IntegrationCredentialRepository } from 'src/integrations/integration_credential.repository';
import { RedisService } from 'src/redis/redis.service';
import { ConversationsCacheRepository } from 'src/redis/repositories/conversation_cache.repository';
import { SmsService } from 'src/sms/sms.service';
import { ChatHistoryMessageRole } from 'src/spark-gpt/entities/dtos/create_completion.dto';
import gptGatewayAPIClient from 'src/spark-gpt/gpt_gateway_api';
import { CompanyContextRepository } from 'src/spark-gpt/repositories/company_context.repository';
import { SparkGPTService } from 'src/spark-gpt/spark_gpt.service';
import { EventDto } from '../app/entities/dtos/event.dto';
import {
  CONVERSATION_CHANNEL,
  CONVERSATION_STATUS,
  CONVERSATION_TYPE,
  MESSAGE_TYPE,
} from './entities/constants';
import { ContactConversationsDto } from './entities/dtos/contact_conversations.dto';
import { UpdateConversationStatusDto } from './entities/dtos/conversation_status.dto';
import { UpdateConversationTitleDto } from './entities/dtos/conversaton_title.dto';
import { CreateConversationWithoutMessageDto } from './entities/dtos/create_conversation_without_message.dto';
import { CreateConversationDto } from './entities/dtos/create_conversations.dto';
import { CreateFaqDto } from './entities/dtos/create_faq.dto';
import { CreateLeadNoteDto } from './entities/dtos/create_lead_note.dto';
import { DeleteFaqDto } from './entities/dtos/delete_faq.dto';
import { DeleteMessageDto } from './entities/dtos/delete_message.dto';
import { GetConfigDto } from './entities/dtos/get_config.dto';
import { GetConversationDto } from './entities/dtos/get_conversation.dto';
import { GetLeadNotesDto } from './entities/dtos/get_lead_notes.dto';
import { GetMessagesDto } from './entities/dtos/get_messages_dto';
import { GetUserInfoDto } from './entities/dtos/get_user_info.dto';
import { NewBulkMessagesDto } from './entities/dtos/new_bulk_messages.dto';
import { NewMessageDto } from './entities/dtos/new_message.dto';
import { NewMessageWithoutSocketDto } from './entities/dtos/new_message_without_socket.dto';
import { ReadReceiptsDto } from './entities/dtos/read_receipts.dto';
import { SearchChatDto } from './entities/dtos/search_chat_dto';
import { SetUserInfoDto } from './entities/dtos/set_user_info.dto';
import { TypingStatusDto } from './entities/dtos/typing_status.dto';
import { UpdateFaqDto } from './entities/dtos/update_faq.dto';
import { UpdateLeadNotesDto } from './entities/dtos/update_lead_notes.dto';
import { UpdateUserInfoDto } from './entities/dtos/update_user_info.dto';
import { Conversations, Messages } from './entities/schema';
import { ConversationsRepository } from './repositories/conversation.repository';
import { FaqsRespository } from './repositories/faq.respository';
import { MessagesRepository } from './repositories/message.repository';
import { NotesRepository } from './repositories/notes.repository';

export type UserInfo = User & { is_online: boolean; web_sessions: number };

@Injectable()
export class ChatService {
  constructor(
    private redisService: RedisService,
    private authService: AuthService,
    private config: ConfigService,
    private widget_config_repository: WidgetConfigRepository,
    private faq_repository: FaqsRespository,
    private user_repository: UserRepository,
    private conversation_cache_repository: ConversationsCacheRepository,
    private messages_repository: MessagesRepository,
    private workspace_repository: WorkspaceRepository,
    private notes_repository: NotesRepository,
    private conversations_repository: ConversationsRepository,
    private company_context_repository: CompanyContextRepository,
    private email_service: EmailService,
    private sms_service: SmsService,
    private integrationCredentialRepository: IntegrationCredentialRepository,
    private error_handling_service: ErrorHandlingService,
    private activityLogsService: ActivityLogsService,
    @InjectModel(Messages.name) private messageModel: Model<Messages>,
    @InjectModel(Users.name) private userModel: Model<Users>,
    private sparkGPTService: SparkGPTService,
  ) {}

  private async introduce_spark_gpt(
    server: Server,
    current_conversation: Conversations,
  ) {
    try {
      // Get or create sparky agent
      const sparky =
        (await this.user_repository.get_by_id(
          (current_conversation?.workspace as WorkSpaces)?.spark_gpt_agent?._id,
        )) ??
        (await this.authService.create_spark_gpt_agent(
          current_conversation?.workspace as WorkSpaces,
        ));

      // Notify client that typing status is on
      const leadId =
        (current_conversation.lead as Users)?.id ?? current_conversation.lead;
      server.to(leadId).emit('typing_status', {
        status: true,
        conversation_id: current_conversation._id,
        user_id: sparky._id,
      });

      // Get needed information
      const companyContext = await this.company_context_repository
        .get_one({
          workspace: (current_conversation?.workspace as WorkSpaces)
            ?._id as mongoose.Schema.Types.ObjectId,
        })
        .then((res) => res?.value);

      const companyName = (current_conversation?.workspace as WorkSpaces)
        ?.company_name;

      const chatHistory = await this.messages_repository
        .get_all({
          conversation: current_conversation?._id,
        })
        .then((res) => {
          return res
            ?.filter((message) => message?.type === MESSAGE_TYPE.TEXT)
            .map((message) => {
              const senderType: ChatHistoryMessageRole =
                (message?.sender as User)?.type === USERTYPE.AGENT
                  ? 'user'
                  : 'assistant';

              return {
                role: senderType,
                content: message?.content?.text,
              };
            });
        });

      // Generate response with GPT-3 API
      const completion = await gptGatewayAPIClient.get_completion({
        companyContext,
        chatHistory,
        companyName,
      });

      // Create new message
      const created_message = await this.messages_repository.create({
        sender: new mongoose.Types.ObjectId(sparky._id),
        conversation: current_conversation,
        content: { text: completion, payload: null },
      });
      const saved_message = await created_message.save();
      current_conversation.last_message = saved_message;
      current_conversation.save();
      const final_message = await this.messages_repository.get_by_id(
        saved_message.id,
      );
      // Notify client that typing status is off and send new message
      server.to(leadId).emit('typing_status', {
        status: false,
        conversation_id: current_conversation._id,
      });
      const workspaceId =
        (current_conversation.workspace as WorkSpaces)?.id ??
        current_conversation.workspace;

      server
        .to(workspaceId)
        .to(leadId)
        .emit('new_message', { data: final_message });
    } catch (e: any) {
      //...
    }
  }

  async getMessages(data: GetMessagesDto) {
    const skip = data.size ? (data.page - 1) * (data.size ?? 10) : undefined;

    const count = await this.messages_repository.get_count({
      conversation: new mongoose.Types.ObjectId(data.conversation_id),
    });

    const result = await this.messages_repository.get_all(
      {
        conversation: new mongoose.Types.ObjectId(data.conversation_id),
      },
      {
        skip: skip ?? undefined,
        limit: data.size ?? undefined,
        sort: { createdAt: data.sort ?? -1 },
      },
    );
    return { data: result, page: data.page ?? 1, count };
  }

  async logically_delete_message(data: DeleteMessageDto) {
    try {
      const deletedMessage =
        await this.messages_repository.logically_delete_by_id(data.message_id);

      const conversation = await this.conversations_repository.get_by_id(
        deletedMessage.conversation as string,
      );

      const wasLastMessage = conversation?.last_message?.id === data.message_id;

      if (wasLastMessage) {
        const newLastMessage = await this.messages_repository.get_one(
          { conversation: conversation._id, deletedAt: null },
          {},
          { sort: { $natural: -1 } },
        );

        await this.conversations_repository.update_one(
          { _id: conversation?._id },
          { last_message: newLastMessage ?? null },
        );
      }

      return { data: !!deletedMessage.deletedAt };
    } catch (error) {
      return { data: false, error: error };
    }
  }

  async get_user_info(id: string) {
    const is_online = await this.redisService.check_is_online(id);
    const web_sessions = await this.redisService.get_user_session_size(id);
    const user = await this.user_repository.get_by_id(id);
    if (user) {
      const final_user = user.toObject();
      delete final_user.password;
      return { ...final_user, is_online, web_sessions };
    } else {
      throw new Error('user not found!');
    }
  }

  async get_user_online_info(_id: string) {
    const is_online = await this.redisService.check_is_online(_id);
    const web_sessions = await this.redisService.get_user_session_size(_id);
    return { is_online, web_sessions, _id };
  }

  async handle_get_online_user_info(
    client: SocketType,
    data: EventDto<GetUserInfoDto>,
  ) {
    try {
      const info = await this.get_user_online_info(data.data.id);
      client.join(get_online_prescence_room_name(data.data.id));
      return { data: { ...info }, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  }

  async handle_update_lead_info(
    client: SocketType,
    data: EventDto<UpdateUserInfoDto>,
  ) {
    // get active workspace
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    try {
      const updated_user = await this.update_lead_info(
        data.data.id,
        data.data.user,
      );
      if (session.active_workspace)
        client
          .to(session.active_workspace)
          .emit('user_lead_info', { data: updated_user });
      return { data: updated_user, error: null };
    } catch (e) {
      return { data: null, error: { msg: e.message, status: 500 } };
    }
  }

  async handle_get_user_info(
    client: SocketType,
    data: EventDto<GetUserInfoDto>,
  ) {
    if (client.user.type === USERTYPE.AGENT) {
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      try {
        const user = await this.user_repository.get_one({
          _id: new mongoose.Types.ObjectId(data.data.id),
        });
        if (user) {
          return { data: user, error: null };
        } else {
          return { data: null, error: { msg: 'user not found' } };
        }
      } catch (e) {
        return { data: null, error: { msg: e, status: 500 } };
      }
    } else {
      try {
        const user = await this.user_repository.get_one({
          _id: new mongoose.Types.ObjectId(data.data.id),
        });
        if (user) {
          return { data: user, error: null };
        } else {
          return { data: null, error: { msg: 'user not found' } };
        }
      } catch (e) {
        return { data: null, error: { msg: e, status: 500 } };
      }
    }
  }

  async update_lead_info(id: string, user: FilterQuery<Users>) {
    const user_result = await this.user_repository.get_by_id(id);
    if (user_result) {
      return this.user_repository.update_one(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: {
            ...user,
          },
        },
      );
    } else {
      throw new Error('user not found');
    }
  }

  async getConfig(payload: EventDto<GetConfigDto>, client: SocketType) {
    if (client.user.type === USERTYPE.AGENT) {
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );

      if (session.active_workspace) {
        const widget_config_result =
          await this.widget_config_repository.get_one({
            workspace: new mongoose.Types.ObjectId(session.active_workspace),
          });

        if (widget_config_result) {
          // found widget
          return { data: widget_config_result, error: null };
        } else {
          // widget not found
          // const user = await this.user_repository.get_by_id(client.user.sub);
          const old_widget_config = await this.widget_config_repository.get_all(
            {
              user: new mongoose.Types.ObjectId(client.user.sub),
            },
          );
          if (old_widget_config) {
            for (let i = 0; i < old_widget_config.length; i++) {
              const current_config = old_widget_config[i];
              if (current_config.toObject().hasOwnProperty('user')) {
                // has user property
                if (current_config.toObject().user === client.user.sub) {
                  // found old config
                  // update old config
                  const updated_config =
                    await this.widget_config_repository.update_one(
                      {
                        _id: current_config._id,
                      },
                      {
                        workspace: new mongoose.Types.ObjectId(
                          session.active_workspace,
                        ),
                      },
                    );
                  return { data: updated_config, error: null };
                }
              }
            }

            // config not found
            // create a new one
            // create new widget config
            const uuid = new mongoose.Types.ObjectId();
            const widget_url = this.config.get('WIDGET_HOSTED_FILE_PATH');
            const widget_config = await this.widget_config_repository.create({
              workspace: new mongoose.Types.ObjectId(session.active_workspace),
              _id: uuid,
              code_snippet: `<script src="${widget_url}"  data-bot-id="${uuid}" async></script>`,
            });
            if (widget_config) {
              return {
                data: widget_config,
                error: null,
              };
            } else {
              return {
                error: {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  msg: 'internal server error',
                },
              };
            }
          } else {
            // create new widget config
            const uuid = new mongoose.Types.ObjectId();
            const widget_url = this.config.get('WIDGET_HOSTED_FILE_PATH');
            const widget_config = await this.widget_config_repository.create({
              workspace: new mongoose.Types.ObjectId(session.active_workspace),
              _id: uuid,
              code_snippet: `<script src="${widget_url}"  data-bot-id="${uuid}" async></script>`,
            });
            if (widget_config) {
              return {
                data: widget_config,
                error: null,
              };
            } else {
              return {
                error: {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  msg: 'internal server error',
                },
              };
            }
          }
        }
      } else {
        return {
          data: null,
          error: { status: 403, msg: 'no active workspace found' },
        };
      }
    } else if (client.user.type === USERTYPE.CLIENT) {
      const id = payload.data.widget_id;
      const config = await this.widget_config_repository.get_by_id(id);
      if (config) {
        return { config };
      }
      return { config: null };
    } else {
      return {
        data: null,
        error: { msg: 'user type not supported', status: 403 },
      };
    }
  }

  async create_lead_note(
    payload: EventDto<CreateLeadNoteDto>,
    client: SocketType,
  ) {
    const new_note = await this.notes_repository.create({
      note: payload.data.note,
      lead: new mongoose.Types.ObjectId(payload.data.lead_id),
      created_by: new mongoose.Types.ObjectId(client.user.sub),
    });

    if (new_note) {
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );

      this.activityLogsService.saveActivityLog(
        {
          created_by: new mongoose.Types.ObjectId(client.user.sub),
          workspace: new mongoose.Types.ObjectId(session.active_workspace),
          contact: new mongoose.Types.ObjectId(payload.data.lead_id),
          action: ActivityLogAction.CREATED,
          type: ActivityLogType.NOTE,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.CREATED}</strong> a note with content: "${payload.data.note}"`,
        },
        client,
      );
    }

    return { data: new_note, error: null };
  }

  async get_lead_notes(payload: EventDto<GetLeadNotesDto>, client: SocketType) {
    const lead_notes = await this.notes_repository.get_all(
      {
        lead: new mongoose.Types.ObjectId(payload.data.id),
      },
      { _id: -1 },
    );

    return { data: lead_notes, error: null };
  }

  async delete_lead_note(
    payload: EventDto<GetLeadNotesDto>,
    client: SocketType,
  ) {
    const deleted_lead_note = await this.notes_repository.delete_by_id(
      payload.data.id,
    );

    if (deleted_lead_note) {
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );

      this.activityLogsService.saveActivityLog(
        {
          created_by: new mongoose.Types.ObjectId(client.user.sub),
          workspace: new mongoose.Types.ObjectId(session.active_workspace),
          contact: new mongoose.Types.ObjectId(deleted_lead_note.lead),
          action: ActivityLogAction.DELETED,
          type: ActivityLogType.NOTE,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.DELETED}</strong> a note with content: "${deleted_lead_note.note}"`,
        },
        client,
      );
    }
    return { data: deleted_lead_note, error: null };
  }

  async update_lead_note(
    payload: EventDto<UpdateLeadNotesDto>,
    client: SocketType,
  ) {
    const updated_lead_note = await this.notes_repository.update_one_by_id(
      payload.data.id,
      {
        $set: {
          note: payload.data.note,
        },
      },
    );

    if (updated_lead_note) {
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );

      this.activityLogsService.saveActivityLog(
        {
          created_by: new mongoose.Types.ObjectId(client.user.sub),
          workspace: new mongoose.Types.ObjectId(session.active_workspace),
          contact: new mongoose.Types.ObjectId(
            updated_lead_note.lead as string,
          ),
          action: ActivityLogAction.DELETED,
          type: ActivityLogType.NOTE,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.UPDATED}</strong> a note with content: "${updated_lead_note.note}"`,
        },
        client,
      );
    }
    return { data: updated_lead_note, error: null };
  }

  async create_faq(payload: EventDto<CreateFaqDto>, client: SocketType) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    const widget_config_result = await this.widget_config_repository.get_by_id(
      payload.data.widget_id,
    );
    if (!widget_config_result)
      return {
        error: { status: 403, msg: 'widget config not found' },
        data: null,
      };
    if (session.active_workspace) {
      const faq_result = await this.faq_repository.create({
        widget_config: widget_config_result._id,
        question: payload.data.question,
        answer: payload.data.answer,
        workspace: new mongoose.Types.ObjectId(session.active_workspace),
      });
      await this.sparkGPTService.verify_and_update_company_context(
        client,
        new mongoose.Types.ObjectId(session.active_workspace),
      );
      return {
        data: faq_result,
        error: null,
      };
    } else {
      return {
        data: null,
        error: { status: 403, msg: 'no active workspace found' },
      };
    }
  }

  async update_faq(payload: EventDto<UpdateFaqDto>, client: SocketType) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    if (session.active_workspace) {
      const faq_result = await this.faq_repository.update_one_by_id(
        payload.data.id,
        { question: payload.data.question, answer: payload.data.answer },
      );
      await this.sparkGPTService.verify_and_update_company_context(
        client,
        new mongoose.Types.ObjectId(session.active_workspace),
      );
      return {
        data: faq_result,
        error: null,
      };
    } else {
      return {
        data: null,
        error: { status: 403, msg: 'no active workspace found' },
      };
    }
  }

  async delete_faq(payload: EventDto<DeleteFaqDto>, client: SocketType) {
    const faq_result = await this.faq_repository.delete_by_id(payload.data.id);
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    if (faq_result) {
      await this.sparkGPTService.verify_and_update_company_context(
        client,
        new mongoose.Types.ObjectId(session.active_workspace),
      );
      return { data: faq_result, error: null };
    } else {
      return { data: null, error: { msg: 'could not delete', status: 500 } };
    }
  }
  async send_receipts(
    payload: EventDto<ReadReceiptsDto>,
    client: SocketType,
    server: Server,
  ) {
    if (client.user.type === USERTYPE.AGENT) {
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      try {
        const result = await this.messages_repository.bulk_operation(
          payload.data.messages.map((msg) => {
            return {
              updateOne: {
                filter: { _id: msg._id },
                update: { seen: true },
              },
            };
          }),
        );

        const conversation_result = await this.conversations_repository.get_one(
          { _id: payload.data.messages[0].conversation },
        );

        server
          .to((conversation_result.workspace as WorkSpaces).id)
          .emit('conversation_update', { data: conversation_result });

        client.to(session.active_workspace).emit('read_receipts', {
          data: {
            conversation_id: (
              payload.data.messages[0].conversation as Conversations
            )?._id,
            messages: payload.data.messages,
            result,
          },
        });

        server
          .to((conversation_result.lead as Users).id)
          .emit('read_receipts', {
            data: {
              conversation_id: (
                payload.data.messages[0].conversation as Conversations
              )?._id,
              messages: payload.data.messages,
              result,
            },
          });
        return {
          error: null,
          data: {
            conversation_id: (
              payload.data.messages[0].conversation as Conversations
            )?._id,
            messages: payload.data.messages,
            result,
          },
        };
      } catch (e: any) {
        Logger.log('Error', e);
        return { error: 'could not save read receipts', data: null };
      }
    } else {
      try {
        const result = await this.messages_repository.bulk_operation(
          payload.data.messages.map((msg) => {
            return {
              updateOne: {
                filter: { _id: msg._id },
                update: { seen: true },
              },
            };
          }),
        );
        const user = await this.user_repository.get_one({
          _id: new mongoose.Types.ObjectId(client.user.user_id),
        });
        const conversation_result = await this.conversations_repository.get_one(
          { _id: payload.data.messages[0].conversation },
        );

        server
          .to((conversation_result.workspace as WorkSpaces).id)
          .emit('conversation_update', { data: conversation_result });
        client.to(user.workspace._id.toString()).emit('read_receipts', {
          data: {
            conversation_id: (
              payload.data.messages[0].conversation as Conversations
            )?._id,
            messages: payload.data.messages,
            result,
          },
        });
        return {
          error: null,
          data: {
            conversation_id: (
              payload.data.messages[0].conversation as Conversations
            )?._id,
            messages: payload.data.messages,
            result,
          },
        };
      } catch (e: any) {
        Logger.log('Error', e);
        return { error: 'could not save read receipts', data: null };
      }
    }
  }
  async get_all_faq(payload: EventDto<GetConfigDto>, client: SocketType) {
    if (client.user.type === USERTYPE.AGENT) {
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );

      if (session.active_workspace) {
        const faq_result = await this.faq_repository.get_all({
          workspace: new mongoose.Types.ObjectId(session.active_workspace),
        });
        return {
          data: faq_result,
          error: null,
        };
      } else {
        return {
          data: null,
          error: { status: 403, msg: 'no active workspace found' },
        };
      }
    } else if (client.user.type === USERTYPE.CLIENT) {
      // widget requesting faqs
      const id = payload.data.widget_id;
      const faq_result = await this.faq_repository.get_all({
        widget_config: new mongoose.Types.ObjectId(id),
      });
      return {
        data: faq_result,
        error: null,
      };
    } else {
      return {
        data: null,
        error: { msg: 'user type not supported', status: 403 },
      };
    }
  }

  async update_config(client: SocketType, data: EventDto<WidgetConfig>) {
    if (client.user.type === USERTYPE.AGENT) {
      // const user = await this.userModel.findById(client.user.sub);
      const session = await this.redisService.get_session(
        client.user.sub,
        client.user.session_id,
      );
      if (session.active_workspace) {
        const widget_config_result =
          await this.widget_config_repository.update_one(
            {
              workspace: new mongoose.Types.ObjectId(session.active_workspace),
            },
            {
              colors: data.data.colors,
              greetings: data.data.greetings,
              images: data.data.images,
              allowed_origins: data.data.allowed_origins,
              chat_suggestions: data.data.chat_suggestions,
              availability: data.data.availability,
            },
          );

        if (widget_config_result) {
          return { data: widget_config_result, error: null };
        } else {
          return {
            data: null,
            error: { status: 404, msg: 'widget config could not be updated.' },
          };
        }
      } else {
        return {
          config: null,
          error: { status: 403, msg: 'no active workspace found' },
        };
      }
    } else {
      return { data: null, error: { status: 403, msg: 'Forbidden' } };
    }
  }

  async get_conversations(client: SocketType, data: GetConversationDto) {
    const skip = (data.page - 1) * data.size;

    if (client && client.user.type == USERTYPE.CLIENT) {
      // get conversations for widget here

      const count = await this.conversations_repository.get_count({
        lead: client.user.user_id,
        status: data.status ? data.status : CONVERSATION_STATUS.OPEN,
      });
      const result = await this.conversations_repository.get_all(
        {
          lead: client.user.user_id,
          status: data.status ? data.status : CONVERSATION_STATUS.OPEN,
        },
        {
          skip: skip ? skip : 0,
          limit: data.size,
        },
      );

      return {
        data: {
          conversations: result,
          error: null,
          page: data.page ? data.page : 1,
          count,
        },
      };
    } else if (client && client.user.type == USERTYPE.AGENT) {
      // get conversations for dashboard here
      //find agent root account
      const agent = await this.userModel.findById(client.user.sub).exec();

      if (agent) {
        // agent found
        // find active workspace for agent
        const session = await this.redisService.get_session(
          agent.id,
          client.user.session_id,
        );

        if (session) {
          const countFilter: { [key: string]: any } = {
            workspace: new mongoose.Types.ObjectId(session.active_workspace),
            status: data.status ?? CONVERSATION_STATUS.OPEN,
            channel: data.channel ?? CONVERSATION_CHANNEL.CHAT,
          };

          if (data.contactId) {
            countFilter.lead = new mongoose.Types.ObjectId(data.contactId);
          }

          const count = await this.conversations_repository.get_count(
            countFilter,
          );
          // session found
          if (session.active_workspace) {
            // found a workspace
            // find conversations by workspace
            const work_space = await this.workspace_repository.get_by_id(
              session.active_workspace,
            );

            let results = [];
            const resultFilter: { [key: string]: any } = {
              workspace: new mongoose.Types.ObjectId(session.active_workspace),
              status: data.status ? data.status : CONVERSATION_STATUS.OPEN,
              channel: data.channel ?? CONVERSATION_CHANNEL.CHAT,
            };

            const resultOptions = {
              skip,
              limit: data.size,
            };

            const resultSort = { updatedAt: data.sort ?? -1 };

            if (data.contactId) {
              resultFilter.lead = new mongoose.Types.ObjectId(data.contactId);
            }

            const result = await this.conversations_repository.get_all(
              resultFilter,
              resultOptions,
              resultSort,
            );

            if (result.length > 0) {
              results = result;
            } else {
              // try getting old shape
              // check old conversations exists

              const old_con_exists =
                await this.conversations_repository.check_exists({
                  root_account: work_space.created_by._id,
                });

              if (old_con_exists) {
                // update old data

                await this.conversations_repository.update_many(
                  { root_account: work_space.created_by._id },
                  {
                    $set: {
                      workspace: work_space._id,
                    },
                    $unset: { root_account: 1 },
                  },
                );
                const oldConversationsFilter = {
                  workspace: new mongoose.Types.ObjectId(
                    session.active_workspace,
                  ),
                  status: data.status ? data.status : CONVERSATION_STATUS.OPEN,
                  channel: data.channel ?? CONVERSATION_CHANNEL.CHAT,
                };

                const oldConversationsOptions = {
                  skip,
                  limit: data.size,
                };

                const oldConversationsSort = { updatedAt: data.sort ?? -1 };

                if (data.contactId) {
                  resultFilter.lead = new mongoose.Types.ObjectId(
                    data.contactId,
                  );
                }

                results = await this.conversations_repository.get_all(
                  oldConversationsFilter,
                  oldConversationsOptions,
                  oldConversationsSort,
                );
              }
            }

            return {
              data: {
                conversations: results,
                error: null,
                page: data.page,
                count,
              },
            };
          } else {
            return {
              data: { conversations: [], page: data.page, count },
              error: { msg: 'no active workspace found', status: 404 },
            };
          }
        } else {
          // session not found

          return {
            data: { conversations: [], count: 0, page: data.page },
            error: { msg: 'could not find session', status: 404 },
          };
        }
      } else {
        return {
          data: { conversations: [], count: 0, page: data.page },
          error: { msg: 'could not find associated agent', status: 404 },
        };
      }
    }
  }

  async get_contact_conversations(
    client: SocketType,
    data: ContactConversationsDto,
  ) {
    const contactId = new mongoose.Types.ObjectId(data.contact_id);

    if (client.user.type !== USERTYPE.AGENT) {
      return {
        data: { conversations: [] },
        error: { msg: 'user is not agent', status: 403 },
      };
    }

    if (!contactId || !client) {
      return {
        data: { conversations: [] },
        error: { msg: 'missing data', status: 400 },
      };
    }

    const agent = await this.userModel.findById(client.user.sub).exec();

    if (!agent) {
      return {
        data: { conversations: [] },
        error: { msg: 'could not find associated agent', status: 404 },
      };
    }

    const session = await this.redisService.get_session(
      agent.id,
      client.user.session_id,
    );

    if (!session) {
      return {
        data: { conversations: [] },
        error: { msg: 'could not find session', status: 404 },
      };
    }

    if (!session.active_workspace) {
      return {
        data: { conversations: [] },
        error: { msg: 'no active workspace found', status: 404 },
      };
    }

    const work_space = await this.workspace_repository.get_by_id(
      session.active_workspace,
    );

    let results = [];

    // Check to ensure retroactive compatibility
    const checkedChannel =
      data.conversation_channel === CONVERSATION_CHANNEL.CHAT
        ? {
            $nin: [
              CONVERSATION_CHANNEL.SMS,
              CONVERSATION_CHANNEL.EMAIL,
              CONVERSATION_CHANNEL.WHATSAPP,
              CONVERSATION_CHANNEL.MESSENGER,
            ],
          }
        : data.conversation_channel;

    const result = await this.conversations_repository.get_all({
      workspace: new mongoose.Types.ObjectId(session.active_workspace),
      lead: contactId,
      channel: checkedChannel,
    });

    if (result.length > 0) {
      results = result;
    } else {
      const old_con_exists = await this.conversations_repository.check_exists({
        root_account: work_space.created_by._id,
        lead: contactId,
      });

      if (old_con_exists) {
        await this.conversations_repository.update_many(
          { root_account: work_space.created_by._id },
          {
            $set: {
              workspace: work_space._id,
            },
            $unset: { root_account: 1 },
          },
        );
        results = await this.conversations_repository.get_all({
          workspace: new mongoose.Types.ObjectId(session.active_workspace),
          lead: contactId,
        });
      }
    }

    return { data: { conversations: results, error: null } };
  }

  async set_user_info(client: SocketType, data: SetUserInfoDto) {
    const lead = await this.userModel.findByIdAndUpdate(
      client.user.user_id,
      {
        'last_known_location.longitude': data.location.longitude,
        'last_known_location.latitude': data.location.latitude,
        city: data.location.city,
        country: data.location.country_name,
        browser: data.browser,
        device: data.device,
      },
      { new: true },
    );
    return { data: lead };
  }

  async create_conversation(
    client: SocketType,
    data: CreateConversationDto,
    server: Server,
  ) {
    if (client && client.user.type === USERTYPE.CLIENT) {
      //TODO:handle auto assingments here
      // create new conversations here
      const widget_config = await this.widget_config_repository.get_by_id(
        client.user.widget_id,
      );

      delete data.message['_id'];
      delete data.message.conversation;

      const created_conversation = await this.conversations_repository.create({
        workspace: (widget_config.workspace as WorkSpaces)._id,
        created_by: new mongoose.Types.ObjectId(client.user.user_id),
        lead: new mongoose.Types.ObjectId(client.user.user_id),
        participants: [new mongoose.Types.ObjectId(client.user.user_id)],
        channel: data?.conversation_channel ?? CONVERSATION_CHANNEL.CHAT,
      });
      const sparky =
        (await this.user_repository.get_by_id(
          (widget_config.workspace as WorkSpaces)?.spark_gpt_agent?._id,
        )) ??
        (await this.authService.create_spark_gpt_agent(
          widget_config.workspace as WorkSpaces,
        ));
      created_conversation.assigned_to.push(sparky._id);
      const created_message = await this.messageModel.create({
        sender: new mongoose.Types.ObjectId(client.user.user_id),
        conversation: created_conversation._id,
        ...data.message,
      });

      created_conversation.last_message = created_message._id;

      const [conversation, message] = await Promise.all([
        created_conversation.save(),
        created_message.save(),
      ]);
      const [final_conversation, final_message] = await Promise.all([
        this.conversations_repository.get_by_id(conversation.id),
        this.messages_repository.get_by_id(message.id),
      ]);

      server
        .to((widget_config.workspace as WorkSpaces).id)
        .emit('new_conversation', {
          data: { message: final_message, conversation: final_conversation },
        });

      // Introducing without waiting for the response
      this.introduce_spark_gpt(server, final_conversation);

      return {
        data: { message: final_message, conversation: final_conversation },
      };
    } else if (client && client.user.type === USERTYPE.AGENT) {
      // create new conversations here
    }

    return { data: { conversation: null, message: null } };
  }

  async create_conversation_without_message(
    data: CreateConversationWithoutMessageDto,
    server: Server,
    client?: SocketType,
  ) {
    if (
      (client && client.user.type === USERTYPE.AGENT) ||
      (data.user && data.user.type === USERTYPE.AGENT) ||
      data.workspace_id
    ) {
      const created_conversation = await this.conversations_repository.create({
        workspace: data.workspace_id,
        lead: new mongoose.Types.ObjectId(data.contact_id),
        participants: [new mongoose.Types.ObjectId(data.contact_id)],
        channel: data.conversation_channel ?? CONVERSATION_CHANNEL.CHAT,
      });

      const conversation = await created_conversation.save();
      const final_conversation = await this.conversations_repository.get_by_id(
        conversation.id,
      );

      server.to(data.workspace_id).emit('new_conversation', {
        data: { conversation: final_conversation },
      });

      return final_conversation;
    } else {
      return {
        data: null,
        error: {
          msg: "empty conversations can't be created by this usertype!",
          status: 403,
        },
      };
    }
  }

  async handle_new_message_without_socket_connection(
    data: NewMessageWithoutSocketDto,
    server: Server,
  ) {
    let workspace = data?.workspace_id
      ? await this.workspace_repository.get_one({
          _id: data?.workspace_id,
        })
      : null;

    if (!workspace) {
      switch (data.conversation_channel) {
        case CONVERSATION_CHANNEL.SMS:
          const twilioCreds: any =
            await this.integrationCredentialRepository.get_one({
              type: 'twilio',
              ['credentials.phoneNumber']: data.receiver_identifier_value,
            });

          workspace = await this.workspace_repository.get_one({
            _id: twilioCreds.workspaceId,
          });
          break;

        default:
          break;
      }
    }

    if (!workspace) {
      return {
        data: null,
        error: {
          msg: 'receiver not found',
          status: 404,
        },
      };
    }

    let sender = await this.user_repository.get_one({
      workspace: workspace?.id ?? workspace,
      [data.sender_identifier]: data.sender_identifier_value,
    });

    if (!sender) {
      sender = await this.user_repository.create({
        workspace: workspace?.id ?? workspace,
        user_name: 'Anonymous',
        type: USERTYPE.CLIENT,
        [data.sender_identifier]: data.sender_identifier_value,
      });

      if (!sender) {
        return {
          data: null,
          error: {
            msg: "couldn't create sender",
            status: 500,
          },
        };
      }
    }

    let conversation = await this.conversations_repository.get_one({
      workspace: workspace._id,
      lead: sender?._id,
      channel: data.conversation_channel,
    });

    if (
      !conversation &&
      (data.conversation_channel === CONVERSATION_CHANNEL.SMS ||
        data.conversation_channel === CONVERSATION_CHANNEL.EMAIL ||
        data.conversation_channel === CONVERSATION_CHANNEL.MESSENGER ||
        data.conversation_channel === CONVERSATION_CHANNEL.WHATSAPP)
    ) {
      if (!sender?._id || !workspace) {
        return {
          data: null,
          error: { msg: 'missing data', status: 400 },
        };
      }

      const newConversationData = {
        conversation_channel: data.conversation_channel,
        contact_id: sender?._id,
        workspace_id: workspace?.id ?? workspace,
      };

      const created_conversation =
        await this.create_conversation_without_message(
          newConversationData,
          server,
        );

      if ((created_conversation as any)?.error) {
        return {
          data: null,
          error: { msg: 'conversation could not be created', status: 500 },
        };
      } else {
        conversation = created_conversation as Conversations;
      }
    }

    const result = await this.messages_repository.create({
      'content.text': data.text,
      attachments: data.attachments,
      conversation: new mongoose.Types.ObjectId(conversation._id),
      sender: new mongoose.Types.ObjectId(sender._id),
    });

    const current_conversation = await this.conversations_repository.update_one(
      { _id: new mongoose.Types.ObjectId(conversation._id) },
      {
        last_message: result._id,
      },
    );
    if (server && current_conversation) {
      server
        .to((current_conversation.workspace as WorkSpaces).id)
        .emit('new_message', { data: current_conversation.last_message });
    }
  }

  async handle_new_message(
    data: NewMessageDto,
    client: SocketType,
    server: Server,
  ) {
    if (client.user.type === USERTYPE.CLIENT) {
      const new_message = await this.messages_repository.create({
        'content.text': data.text,
        attachments: data.attachments,
        type: data.msg.type,
        conversation: new mongoose.Types.ObjectId(data.conversation_id),
        sender: new mongoose.Types.ObjectId(client.user.user_id),
      });
      if (new_message.type === MESSAGE_TYPE.SWITCH_TO_AGENT) {
        // switch over client here
        await this.conversations_repository.update_one(
          { _id: new mongoose.Types.ObjectId(data.conversation_id) },
          {
            assigned_to: [],
          },
        );
      }
      const final = await this.messages_repository.get_by_id(new_message.id);
      const sender = await this.user_repository.get_by_id(client.user.user_id);
      const current_conversation =
        await this.conversations_repository.update_one(
          { _id: new mongoose.Types.ObjectId(data.conversation_id) },
          {
            last_message: final._id,
          },
        );
      // Get or create sparky agent

      if (current_conversation) {
        if (
          current_conversation.assigned_to.length > 0 &&
          (current_conversation.assigned_to[0] as Users).type === USERTYPE.BOT
        ) {
          // conversation not assigned
          client
            .to((current_conversation.workspace as WorkSpaces).id)
            .emit('new_message', { data: final });

          // Introducing without waiting for the response
          this.introduce_spark_gpt(server, current_conversation);
        } else if (
          data.conversation_channel !== CONVERSATION_CHANNEL.SMS &&
          data.conversation_channel !== CONVERSATION_CHANNEL.EMAIL &&
          data.conversation_channel !== CONVERSATION_CHANNEL.MESSENGER &&
          data.conversation_channel !== CONVERSATION_CHANNEL.WHATSAPP
        ) {
          current_conversation.assigned_to.forEach(async (item) => {
            if (item.email) {
              await this.email_service.send_email({
                to: item.email,
                subject: 'You have a new Message on SparkHub',
                // html: html_to_send,
                text: `You have a new message from ${sender.user_name}.\n Message: ${data.text} \n Please reply as soon as possible.`,
                namespace: 'SparkHub',
              });
            }
          });

          // conversation already assigned
          const assigned = current_conversation.assigned_to as string[];
          client
            .to((current_conversation.workspace as WorkSpaces).id)
            .emit('new_message', { data: final });

          assigned.forEach((item) => {
            client.to(item).emit('new_message', { data: final });
          });
        }
      }
      return { data: final };
    } else if (client.user.type === USERTYPE.AGENT) {
      let initial_conversation =
        (await this.conversations_repository.get_by_id(data.conversation_id)) ??
        (await this.conversations_repository.get_one({
          lead: data.contact_id,
          channel: data.conversation_channel,
        }));

      const conversation_channel =
        initial_conversation?.channel ?? data?.conversation_channel;

      if (
        !initial_conversation &&
        (conversation_channel === CONVERSATION_CHANNEL.SMS ||
          conversation_channel === CONVERSATION_CHANNEL.EMAIL ||
          conversation_channel === CONVERSATION_CHANNEL.MESSENGER ||
          conversation_channel === CONVERSATION_CHANNEL.WHATSAPP)
      ) {
        if (
          !data.contact_id ||
          ((!data.workspace_id &&
            !(initial_conversation.workspace as WorkSpaces)?.id) ??
            initial_conversation.workspace)
        ) {
          return {
            data: null,
            error: { msg: 'missing data', status: 400 },
          };
        }

        const workspaceId =
          data.workspace_id ??
          (initial_conversation.workspace as WorkSpaces)?.id ??
          initial_conversation.workspace;

        const newConversationData = {
          conversation_channel: conversation_channel,
          contact_id: data.contact_id,
          workspace_id: workspaceId,
        };

        const created_conversation =
          await this.create_conversation_without_message(
            newConversationData,
            server,
            client,
          );

        if ((created_conversation as any)?.error) {
          this.error_handling_service.emitErrorEventToDashboard(
            workspaceId,
            ERROR_MESSAGES.CONVERSATION_NOT_CREATED,
          );

          return {
            data: null,
            error: {
              msg: ERROR_MESSAGES.CONVERSATION_NOT_CREATED,
              status: 500,
            },
          };
        } else {
          initial_conversation = created_conversation as Conversations;
        }
      } else if (!initial_conversation) {
        return {
          data: null,
          error: { msg: 'conversation not found', status: 404 },
        };
      }
      switch (conversation_channel) {
        case CONVERSATION_CHANNEL.SMS:
          const lead = (initial_conversation?.lead as Users)?.id
            ? (initial_conversation?.lead as Users)
            : await this.user_repository.get_by_id(
                initial_conversation?.lead as string,
              );

          const sendSmsEventData = {
            event_name: 'send_sms',
            data: {
              to: [lead?.phone_number],
              from: client.user?.phone_number,
              body: data.text,
            },
          };

          const smsSendingResult = await this.sms_service.sendSms(
            sendSmsEventData,
            client,
          );

          if (smsSendingResult.rejected.length > 0) {
            this.error_handling_service.emitErrorEventToDashboard(
              data.workspace_id ??
                (initial_conversation.workspace as WorkSpaces)?.id ??
                initial_conversation.workspace,
              ERROR_MESSAGES.SMS_FAILED_FOR +
                smsSendingResult.rejected
                  .map((rejected) => rejected.to)
                  .join(', '),
            );
          }

          break;

        case CONVERSATION_CHANNEL.EMAIL:
          break;

        case CONVERSATION_CHANNEL.MESSENGER:
          break;

        case CONVERSATION_CHANNEL.WHATSAPP:
          break;

        default:
          break;
      }

      const conversationData = {
        ...data,
        conversation_id: initial_conversation.id,
      };

      // check if conversation is assigned or not
      if (
        (initial_conversation.assigned_to[0] as Users).type !== USERTYPE.BOT
      ) {
        // conversation is assigned
        return this.send_message_to_assigned_conversation(
          conversationData,
          client,
          server,
          initial_conversation,
        );
      } else {
        // conversation is not assigned

        return this.send_message_to_unassigned_conversation(
          conversationData,
          client,
          server,
        );
      }
    }
  }

  async handle_bulk_messages(data: NewBulkMessagesDto, client: SocketType) {
    if (client.user.type !== USERTYPE.AGENT) {
      return {
        data: null,
        error: {
          msg: "bulk messages can't be sent by this usertype!",
          status: 403,
        },
      };
    }

    if (!(data.contact_id_list.length > 0)) {
      return {
        data: null,
        error: {
          msg: 'contact list is empty!',
          status: 400,
        },
      };
    }

    if (!data.text) {
      return {
        data: null,
        error: {
          msg: 'text is empty!',
          status: 400,
        },
      };
    }

    if (
      !Object.values(CONVERSATION_CHANNEL).some(
        (value) => value === data.conversation_channel,
      )
    ) {
      return {
        data: null,
        error: {
          msg: 'invalid conversation channel!',
          status: 400,
        },
      };
    }
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    data.contact_id_list.forEach(async (contact_id) => {
      await this.redisService.PushList('one_message_from_bulk', {
        user: { ...client.user, refresh_token: session?.refresh_token },
        workspace_id: session.active_workspace,
        contact_id: contact_id,
        conversation_channel: data.conversation_channel,
        text: data.text,
        attachments: data.attachments,
      });
    });
  }

  async send_message_to_assigned_conversation(
    data: NewMessageDto,
    client: SocketType,
    server: Server,
    initial_conversation: Conversations,
  ) {
    const assignment_array = initial_conversation.assigned_to as Users[];
    if (assignment_array.length) {
    }

    if (assignment_array.filter((e) => e.id === client.user.sub).length === 0) {
      if (
        (initial_conversation.workspace as WorkSpaces).created_by._id !==
        client.user.sub
      ) {
        return {
          data: null,
          error: {
            msg: 'this conversation is not assigned to you!',
            status: 403,
          },
        };
      } else {
        const new_message = await this.messages_repository.create({
          'content.text': data.text,
          attachments: data.attachments,
          conversation: data.conversation_id,
          sender: new mongoose.Types.ObjectId(client.user.sub),
        });
        let final: Messages;
        let current_conversation: Conversations;
        let info_message_result: Messages;

        if (initial_conversation.type === CONVERSATION_TYPE.SINGLE) {
          // replace assigned array
          [final, current_conversation] = await Promise.all([
            await this.messages_repository.get_by_id(new_message.id),
            await this.conversations_repository.update_one(
              { _id: new mongoose.Types.ObjectId(data.conversation_id) },
              {
                last_message: new_message._id,
                assigned_to: [new mongoose.Types.ObjectId(client.user.sub)],
              },
            ),
          ]);

          info_message_result = await this.messages_repository.create({
            'content.text': `${
              (final.sender as Users).user_name
            } assigned themselves to this conversation`,
            type: MESSAGE_TYPE.INFO,
            conversation: data.conversation_id,
            sender: new mongoose.Types.ObjectId(client.user.sub),
          });
          // info_message_result = await new_info_message.save();
        } else if (
          initial_conversation.type === CONVERSATION_TYPE.GROUP ||
          initial_conversation.type === CONVERSATION_TYPE.COLABORATION
        ) {
          // replace assigned array
          const sender = await this.user_repository.get_by_id(client.user.sub);
          [final, current_conversation] = await Promise.all([
            await this.messages_repository.get_by_id(new_message.id),

            await this.conversations_repository.update_one(
              { _id: new mongoose.Types.ObjectId(data.conversation_id) },
              {
                last_message: new_message._id,
                assigned_to: [sender],
              },
            ),
          ]);
          info_message_result = await this.messages_repository.create({
            'content.text': `${
              (final.sender as Users).user_name
            } assigned themselves to this conversation`,
            type: MESSAGE_TYPE.INFO,
            conversation: data.conversation_id,
            sender: new mongoose.Types.ObjectId(client.user.sub),
          });
          // info_message_result = await new_info_message.save();
        } else {
          // replace assigned array
          [final, current_conversation] = await Promise.all([
            await this.messages_repository.get_by_id(new_message.id),
            await this.conversations_repository.update_one(
              { _id: new mongoose.Types.ObjectId(data.conversation_id) },
              {
                last_message: new_message._id,
                assigned_to: [new mongoose.Types.ObjectId(client.user.sub)],
              },
            ),
          ]);

          info_message_result = await this.messages_repository.create({
            'content.text': `${
              (final.sender as Users).user_name
            } assigned themselves to this conversation`,
            type: MESSAGE_TYPE.INFO,
            conversation: data.conversation_id,
            sender: new mongoose.Types.ObjectId(client.user.sub),
          });
          // info_message_result = await new_info_message.save();
        }

        if (current_conversation) {
          const assigned = current_conversation.assigned_to as string[];
          if (info_message_result) {
            server
              .to((current_conversation.workspace as WorkSpaces).id)
              .emit('new_message', { data: info_message_result });
            assigned.forEach((item) => {
              if ((current_conversation.workspace as WorkSpaces).id !== item) {
                client.to(item).emit('new_message', { data: final });
              }
            });
          }
          client
            .to((current_conversation.workspace as WorkSpaces).id)
            .emit('new_message', { data: final });
          // client
          //   .to((current_conversation.workspace as WorkSpaces).id)
          //   .emit('conversation_update', { data: current_conversation });

          server
            .to((current_conversation.workspace as WorkSpaces).id)
            .emit('conversation_update', { data: current_conversation });
          if (current_conversation.lead) {
            client
              .to((current_conversation.lead as Users).id)
              .emit('new_message', { data: final });
          }

          assigned.forEach((item) => {
            if (client.user.sub !== item) {
              client.to(item).emit('new_message', { data: final });
            }
          });
        }
        return { data: final };
      }
    } else {
      // user assigned to conversation proceed

      const result = await this.messages_repository.create({
        'content.text': data.text,
        attachments: data.attachments,
        conversation: new mongoose.Types.ObjectId(data.conversation_id),
        sender: new mongoose.Types.ObjectId(client.user.sub),
      });

      const [final, current_conversation] = await Promise.all([
        await this.messages_repository.get_by_id(result.id),
        await this.conversations_repository.update_one(
          { _id: new mongoose.Types.ObjectId(data.conversation_id) },
          {
            last_message: result._id,
          },
        ),
      ]);
      if (current_conversation) {
        // client
        //   .to((current_conversation.workspace as WorkSpaces).id)
        //   .emit('new_message', { data: final });

        server
          .to((current_conversation.workspace as WorkSpaces).id)
          .emit('conversation_update', { data: current_conversation });
        if (current_conversation.lead) {
          client
            .to((current_conversation.lead as Users).id)
            .emit('new_message', { data: final });
        }
        const assigned = current_conversation.assigned_to as string[];
        assigned.forEach((item) => {
          if (client.user.sub !== item) {
            client.to(item).emit('new_message', { data: final });
          }
        });
      }
      return { data: final };
    }
  }

  async send_message_to_unassigned_conversation(
    data: NewMessageDto,
    client: SocketType,
    server: Server,
  ) {
    const sender = await this.user_repository.get_by_id(client.user.sub);
    const conversation = await this.conversations_repository.update_one(
      { _id: new mongoose.Types.ObjectId(data.conversation_id) },
      {
        assigned_to: [sender],
      },
    );
    const info_message_result = await this.messages_repository.create({
      'content.text': ``,
      'content.payload': {
        assigned_user: sender,
        assigned_by: sender,
        date: conversation.updatedAt,
      },
      type: MESSAGE_TYPE.INFO,
      conversation: new mongoose.Types.ObjectId(data.conversation_id),
      sender: new mongoose.Types.ObjectId(client.user.sub),
    });

    const result = await this.messages_repository.create({
      'content.text': data.text,
      attachments: data.attachments,
      conversation: new mongoose.Types.ObjectId(data.conversation_id),
      sender: new mongoose.Types.ObjectId(client.user.sub),
    });

    // const info_message_result = await new_info_message.save();
    // const result = await new_message.save();
    // const sender = await this.user_repository.get_by_id(client.user.sub);
    const [final, info_message, current_conversation] = await Promise.all([
      await this.messages_repository.get_by_id(result.id),
      await this.messages_repository.get_by_id(info_message_result.id),
      await this.conversations_repository.update_one(
        { _id: new mongoose.Types.ObjectId(data.conversation_id) },
        {
          last_message: result._id,
        },
      ),
    ]);

    if (current_conversation) {
      const assigned = current_conversation.assigned_to as Users[];

      if (info_message) {
        server
          .to((current_conversation.workspace as WorkSpaces).id)
          .emit('new_message', { data: info_message });
        // assigned.forEach((item) => {
        //   if ((current_conversation.workspace as WorkSpaces).id !== item) {
        //     client.to(item).emit('new_message', { data: final });
        //   }
        // });
      }
      // client
      //   .to((current_conversation.workspace as WorkSpaces).id)
      //   .emit('new_message', { data: final });
      // client
      //   .to((current_conversation.workspace as WorkSpaces).id)
      //   .emit('conversation_update', { data: current_conversation });

      server
        .to((current_conversation.workspace as WorkSpaces).id)
        .emit('conversation_update', { data: current_conversation });
      if (current_conversation.lead) {
        client
          .to((current_conversation.lead as Users).id)
          .emit('new_message', { data: final });
      }
      // TODO:make it so that only admins and assigned agents recieve messages
      assigned.forEach((item) => {
        if (client.user.sub !== item.id) {
          client.to(item.id).emit('new_message', { data: final });
        }
      });
    }
    return { data: final };
  }

  async handle_set_typing(client: SocketType, data: EventDto<TypingStatusDto>) {
    // get conversation participants
    const exits = await this.conversation_cache_repository.check_exists(
      data.data.conversation_id,
    );
    if (exits) {
      // get cached database conversation
      const cached_conversation =
        await this.conversation_cache_repository.get_cached_conversation(
          data.data.conversation_id,
        );
      if (cached_conversation) {
        const workspace_id = (cached_conversation.workspace as WorkSpaces).id
          ? (cached_conversation.workspace as WorkSpaces).id
          : cached_conversation.workspace;
        const lead_id = cached_conversation.lead._id
          ? cached_conversation.lead._id
          : cached_conversation.lead;
        if (client.user.type !== USERTYPE.CLIENT) {
          client.to(lead_id).emit('typing_status', {
            ...data.data,
            user_id:
              client.user.type === USERTYPE.AGENT
                ? client.user.sub
                : client.user.user_id,
          });
        }

        if (cached_conversation.assigned_to.length <= 0) {
          client.to(workspace_id).emit('typing_status', {
            ...data.data,
            user_id:
              client.user.type === USERTYPE.AGENT
                ? client.user.sub
                : client.user.user_id,
          });
        }
        cached_conversation.assigned_to.forEach((user) => {
          client.to(user._id ? user._id : user).emit('typing_status', {
            ...data.data,
            user_id:
              client.user.type === USERTYPE.AGENT
                ? client.user.sub
                : client.user.user_id,
          });
        });
      }
    } else {
      // cache database conversation
      const conversation = await this.conversations_repository.get_by_id(
        data.data.conversation_id,
      );
      if (conversation) {
        const workspace_id = (conversation.workspace as WorkSpaces).id
          ? (conversation.workspace as WorkSpaces).id
          : conversation.workspace;
        const lead_id = (conversation.lead as Users).id
          ? (conversation.lead as Users).id
          : (conversation.lead as string);
        const result =
          await this.conversation_cache_repository.cache_conversation(
            conversation.id,
            conversation,
          );
        if (result) {
          if (conversation.assigned_to.length <= 0) {
            client.to(workspace_id).emit('typing_status', {
              ...data.data,
              user_id:
                client.user.type === USERTYPE.AGENT
                  ? client.user.sub
                  : client.user.user_id,
            });
          }
          client.to(lead_id).emit('typing_status', {
            ...data.data,
            user_id:
              client.user.type === USERTYPE.AGENT
                ? client.user.sub
                : client.user.user_id,
          });
          conversation.assigned_to.forEach((user) => {
            client.to(user._id).emit('typing_status', {
              ...data.data,
              user_id:
                client.user.type === USERTYPE.AGENT
                  ? client.user.sub
                  : client.user.user_id,
            });
          });
        }
      } else {
        return {
          error: { status: 404, msg: 'conversation not found' },
          data: null,
        };
      }
    }
  }

  async handle_update_conversation_title(
    client: SocketType,
    data: EventDto<UpdateConversationTitleDto>,
  ) {
    try {
      const conversation = await this.conversations_repository.update_one(
        { _id: new mongoose.Types.ObjectId(data.data.conversation_id) },
        {
          title: data.data.title,
        },
      );
      client
        .to((conversation.workspace as WorkSpaces).id)
        .emit('conversation_update', { data: conversation });
      return { data: conversation, status: 200, error: null };
    } catch (e: any) {
      return {
        data: null,
        status: 500,
        error: 'Failed to update conversation',
      };
    }
  }

  async handle_update_conversation_status(
    client: SocketType,
    data: EventDto<UpdateConversationStatusDto>,
  ) {
    try {
      const conversation = await this.conversations_repository.update_one(
        { _id: new mongoose.Types.ObjectId(data.data.conversation_id) },
        {
          status: data.data.status,
        },
      );
      client
        .to((conversation.workspace as WorkSpaces).id)
        .emit('conversation_update', { data: conversation });
      conversation.assigned_to.forEach(async (item) => {
        if (!(item?.type === USERTYPE.BOT)) {
          await this.email_service.send_email({
            to: item.email,
            subject: 'Conversation status changed',
            // html: html_to_send,
            text: `Conversation ${conversation._id} status changed to ${data.data.status}.`,
            namespace: 'SparkHub',
          });
        }
      });
      return { data: conversation, status: 200, error: null };
    } catch (e: any) {
      return {
        data: null,
        status: 500,
        error: 'Failed to update conversation',
      };
    }
  }
  async handle_search_chat(client: SocketType, data: EventDto<SearchChatDto>) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    const result = await this.messages_repository.search_message(
      data.data.term,
    );

    const final_result = new Map<string, Conversations>();
    result.forEach((msg) => {
      if (final_result.has((msg.conversation as Conversations)?._id)) {
        const current_con = final_result.get(
          (msg.conversation as Conversations)?._id,
        );
        current_con.messages.push(msg);
        final_result.set((msg.conversation as Conversations)?._id, current_con);
      } else {
        if (
          session.active_workspace ===
          (msg.conversation as Conversations)?.workspace.toString()
        ) {
          final_result.set((msg.conversation as Conversations)?._id, {
            ...(msg.conversation as any),
            messages: [msg],
          });
        }
      }
    });
    return {
      data: Array.from(final_result),
      status: 200,
      error: null,
    };
  }
}
