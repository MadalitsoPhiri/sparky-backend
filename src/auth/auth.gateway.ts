import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { ChatService } from 'src/chat/chat.service';
import { AuthService } from './auth.service';
import { USERTYPE } from './entities';
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
import { SocketAuthGuard } from './entities/guard';
import { SocketType } from './entities/types';
import Event from './entities/types/event';
import { get_online_prescence_room_name } from './utilities';

@WebSocketGateway()
export class AuthGateWay {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('refresh_token')
  async handleRefreshToken(
    @MessageBody() data: Event,
    @ConnectedSocket() client: SocketType,
  ) {
    await this.authService.verifyAndUpdateSocketToken(client, data);
  }

  @SubscribeMessage('invite_team_mates')
  async handleInviteTeamMate(
    @MessageBody() data: EventDto<InviteTeamMatesDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_send_invite(client, data.data);
  }

  @SubscribeMessage('resend_invite_to_team_mates')
  async handleResendInviteTeamMate(
    @MessageBody() data: EventDto<ResendInviteTeamMateDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_resend_invite(client, data.data);
  }

  @SubscribeMessage('delete_invite')
  async handleDeleteInvite(
    @MessageBody() data: EventDto<CheckInviteTeamMatesDto>,
  ) {
    return this.authService.handle_delete_invite(data.data);
  }

  @SubscribeMessage('delete_team_mate')
  async handleDeleteTeamMate(
    @MessageBody() data: EventDto<DeleteTeamMatesDto>,
  ) {
    return this.authService.remove_team_mate_from_workspace(data.data);
  }

  @SubscribeMessage('verify_email')
  async handleVerification(
    @MessageBody() data: EventDto<EmailVerificationDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_verification(client, data.data);
  }

  @SubscribeMessage('send_verification_email')
  async handleSendVerification(@ConnectedSocket() client: SocketType) {
    return this.authService.handle_send_verification_email(client);
  }

  @SubscribeMessage('check_team_mate_invite')
  async handleCheckTeamMateInvite(
    @MessageBody() data: EventDto<CheckInviteTeamMatesDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_check_invite(client, data.data);
  }

  @SubscribeMessage('get_invites')
  async handleGetInvites(
    @MessageBody() data: EventDto<CheckInviteTeamMatesDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_get_invites(client);
  }

  @SubscribeMessage('get_team_mates')
  async handleGetTeamMates(
    @MessageBody() data: EventDto<CheckInviteTeamMatesDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_get_team_mates(client);
  }
  @SubscribeMessage('join_workspace')
  async handleJoinTeamMate(
    @MessageBody() data: EventDto<CheckInviteTeamMatesDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_join_team(client, data.data);
  }

  @SubscribeMessage('create_workspace')
  async handle_create_workspace(
    @MessageBody() data: EventDto<WorkSpaceDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_socket_create_workspace(data, client);
    // return WsException()
  }

  @SubscribeMessage('update_workspace')
  async handle_update_workspace(
    @MessageBody() payload: EventDto<UpdateWorkSpaceDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.update_workspace(client, payload.data);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('ack_retry_events')
  async handleRetryAck(
    @MessageBody() data: EventDto<any>,
    @ConnectedSocket() client: SocketType,
  ) {
    await this.authService.deleteClientEventQueue(client);
  }

  @SubscribeMessage('change_active_workspace_data')
  async handle_change_active_workspace_data(
    @MessageBody() data: EventDto<ChangeWorkSpaceDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.authService.handle_socket_change_active_workspace_data(
      client,
      data.data,
    );
  }

  async handleConnection(client: SocketType) {
    // update online presence here

    let timeout = null;
    this.authService.updateLastSeen(client);

    client.conn.on('packet', (packet) => {
      if (packet.type === 'pong') {
        clearTimeout(timeout);
        // user still online update last seen
        this.authService.updateLastSeen(client);
      }
    });
    client.conn.on('packetCreate', (packet) => {
      if (packet.type === 'ping') {
        timeout = setTimeout(() => {
          this.handleDisconnect(client);
          // user still online update last seen
        }, this.server._connectTimeout);
      }
    });
    if (client.user.type === USERTYPE.AGENT) {
      client.join(client.user.sub);

      try {
        await this.authService.join_active_workspace(client);
        await this.authService.ExecuteQueuedEvents(client);
        const online_user_info = await this.chatService.get_user_online_info(
          client.user.sub,
        );

        if (online_user_info) {
          // has online user info
          if (!online_user_info.is_online) {
            this.server
              .to(get_online_prescence_room_name(client.user.sub))
              .emit('user_online_info', {
                data: { ...online_user_info, is_online: true },
              });
            // emit user online here
          }
        }

        const result1 = await this.authService.current_server_set_status_online(
          client.user.sub,
          client.id,
          client,
        );
        const result2 = await this.authService.add_current_server_online_user(
          client.user.sub,
          client.id,
          client,
        );
      } catch (e) {
        console.log('Error', e);
      }
    } else if (client.user.type === USERTYPE.CLIENT) {
      client.join(client.user.user_id);

      try {
        await this.authService.ExecuteQueuedEvents(client);
        const online_user_info = await this.chatService.get_user_info(
          client.user.user_id,
        );

        if (online_user_info) {
          if (!online_user_info.is_online) {
            this.server
              .to(get_online_prescence_room_name(client.user.user_id))
              .emit('user_online_info', {
                data: { ...online_user_info, is_online: true },
              });
          }
        }
        const result1 = this.authService.current_server_set_status_online(
          client.user.user_id,
          client.id,
          client,
        );
        const result2 = this.authService.add_current_server_online_user(
          client.user.user_id,
          client.id,
          client,
        );
      } catch (e) {
        console.log('Error', e);
      }
    }
  }
  async handleDisconnect(client: SocketType) {
    // update online presence here
    this.authService.updateLastSeen(client);
    if (client.user.type === USERTYPE.AGENT) {
      //client.join(client.user.sub);
      try {
        await this.authService.current_server_set_status_offline(
          client.user.sub,
          client.id,
        );
        const online_user_info = await this.chatService.get_user_info(
          client.user.sub,
        );
        if (!online_user_info) {
          this.server
            .to(get_online_prescence_room_name(client.user.sub))
            .emit('user_online_info', {
              data: { ...online_user_info },
            });
          // emit user online here
        }
      } catch (e) {
        console.log('Error:', e);
      }
    } else if (client.user.type === USERTYPE.CLIENT) {
      //client.join(client.user.user_id);
      try {
        await this.authService.current_server_set_status_offline(
          client.user.user_id,
          client.id,
        );
        const online_user_info = await this.chatService.get_user_info(
          client.user.user_id,
        );
        if (online_user_info) {
          this.server
            .to(get_online_prescence_room_name(client.user.user_id))
            .emit('user_online_info', {
              data: { ...online_user_info },
            });
          // emit user online here
        }
      } catch (e) {
        console.log('Error:', e);
      }
    }
  }
}
