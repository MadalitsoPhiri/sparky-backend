import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WidgetConfig } from 'src/auth/entities';
import { SocketAuthGuard } from 'src/auth/entities/guard';
import { SocketType } from 'src/auth/entities/types';
import { EventDto } from '../app/entities/dtos/event.dto';
import { ChatService } from './chat.service';
import { ContactConversationsDto } from './entities/dtos/contact_conversations.dto';
import { UpdateConversationStatusDto } from './entities/dtos/conversation_status.dto';
import { UpdateConversationTitleDto } from './entities/dtos/conversaton_title.dto';
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
import { ReadReceiptsDto } from './entities/dtos/read_receipts.dto';
import { SearchChatDto } from './entities/dtos/search_chat_dto';
import { SetUserInfoDto } from './entities/dtos/set_user_info.dto';
import { TypingStatusDto } from './entities/dtos/typing_status.dto';
import { UpdateFaqDto } from './entities/dtos/update_faq.dto';
import { UpdateLeadNotesDto } from './entities/dtos/update_lead_notes.dto';
import { UpdateUserInfoDto } from './entities/dtos/update_user_info.dto';
import { UpdateUserEmailDto } from './entities/dtos/update_user_email.dto';

@WebSocketGateway()
export class ChatGateWay {
  constructor(private chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('set_user_info')
  handleAgentMessage(
    @MessageBody() data: EventDto<SetUserInfoDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.chatService.set_user_info(client, data.data);
  }
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('new_message')
  handleClientMessage(
    @MessageBody() data: EventDto<NewMessageDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.chatService.handle_new_message(data.data, client, this.server);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('new_bulk_messages')
  handleClientBulkMessages(
    @MessageBody() data: EventDto<NewBulkMessagesDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.chatService.handle_bulk_messages(data.data, client);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_conversations')
  handleGetConversations(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<GetConversationDto>,
  ) {
    return this.chatService.get_conversations(client, data.data);
  }
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_contact_conversations')
  handleGetContactConversations(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<ContactConversationsDto>,
  ) {
    return this.chatService.get_contact_conversations(client, data.data);
  }

  @SubscribeMessage('create_conversation')
  handle_create_conversation(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<CreateConversationDto>,
  ) {
    return this.chatService.create_conversation(client, data.data, this.server);
  }
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_messages')
  handleGetMessages(@MessageBody() data: EventDto<GetMessagesDto>) {
    return this.chatService.getMessages(data.data);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('delete_message')
  logicallyDeleteMessage(@MessageBody() data: EventDto<DeleteMessageDto>) {
    return this.chatService.logically_delete_message(data.data);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_config')
  handleGetConfig(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<GetConfigDto>,
  ) {
    return this.chatService.getConfig(data, client);
  }

  // @UseGuards(SocketAuthGuard)
  @SubscribeMessage('add_faq')
  handleAddFaq(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<CreateFaqDto>,
  ) {
    return this.chatService.create_faq(data, client);
  }
  @SubscribeMessage('delete_faq')
  handleDeleteFaq(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<DeleteFaqDto>,
  ) {
    return this.chatService.delete_faq(data, client);
  }
  @SubscribeMessage('read_receipts')
  handleReadReceipts(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<ReadReceiptsDto>,
  ) {
    return this.chatService.send_receipts(data, client, this.server);
  }
  @SubscribeMessage('update_faq')
  handleUpdateFaq(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<UpdateFaqDto>,
  ) {
    return this.chatService.update_faq(data, client);
  }
  @SubscribeMessage('get_faqs')
  handleGetFaq(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<GetConfigDto>,
  ) {
    return this.chatService.get_all_faq(data, client);
  }

  @SubscribeMessage('get_lead_notes')
  handleGetLeadNotes(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<GetLeadNotesDto>,
  ) {
    return this.chatService.get_lead_notes(data, client);
  }
  @SubscribeMessage('create_lead_note')
  handleCreateLeadNote(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<CreateLeadNoteDto>,
  ) {
    return this.chatService.create_lead_note(data, client);
  }

  @SubscribeMessage('delete_lead_note')
  handleDeleteLeadNote(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<GetLeadNotesDto>,
  ) {
    return this.chatService.delete_lead_note(data, client);
  }
  @SubscribeMessage('update_lead_note')
  handleUpdateLeadNote(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<UpdateLeadNotesDto>,
  ) {
    return this.chatService.update_lead_note(data, client);
  }
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_user_online_info')
  handle_get_user_online_info(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<GetUserInfoDto>,
  ) {
    return this.chatService.handle_get_online_user_info(client, data);
  }

  // @UseGuards(SocketAuthGuard)
  @SubscribeMessage('set_typing_status')
  handle_set_typing(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<TypingStatusDto>,
  ) {
    // return this.chatService.handle_get_online_user_info(client, data);
    return this.chatService.handle_set_typing(client, data);
  }
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('update_user_info')
  async handle_update_user_info(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<UpdateUserInfoDto>,
  ) {
    Logger.log('Data:', data);

    return this.chatService.handle_update_lead_info(client, data);
  }
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('update_user_email')
  async handle_update_user_email(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<UpdateUserEmailDto>,
  ) {
    Logger.log('Data:', data);
    
    return this.chatService.handle_update_lead_email(client, data);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_user_info')
  async handle_get_user_info(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<GetUserInfoDto>,
  ) {
    return this.chatService.handle_get_user_info(client, data);
  }
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('update_config')
  handle_update_config(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<WidgetConfig>,
  ) {
    return this.chatService.update_config(client, data);
  }
  @SubscribeMessage('update_conversation_title')
  handle_update_conversation_title(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<UpdateConversationTitleDto>,
  ) {
    return this.chatService.handle_update_conversation_title(client, data);
  }

  @SubscribeMessage('update_conversation_status')
  handle_update_conversation_status(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<UpdateConversationStatusDto>,
  ) {
    return this.chatService.handle_update_conversation_status(client, data);
  }

  @SubscribeMessage('search_chat')
  handle_search_chat(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<SearchChatDto>,
  ) {
    return this.chatService.handle_search_chat(client, data);
  }
}
