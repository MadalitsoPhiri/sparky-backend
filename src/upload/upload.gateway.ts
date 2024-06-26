import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { SocketType } from 'src/auth/entities/types';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { UploadDto } from './entities/dtos/upload.dto';
import { UploadService } from './upload.service';
import { DeleteDto } from './entities/dtos/delete.dto';

@WebSocketGateway()
export class UploadGateway {
  constructor(private upload_Service: UploadService) {}
  @SubscribeMessage('upload')
  handleUpload(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<UploadDto>,
  ) {
    return this.upload_Service.handle_upload(client, data.data);
  }
  @SubscribeMessage('delete_file')
  deleteFile(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<DeleteDto>,
  ) {
    return this.upload_Service.handleDeleteFile(data.data);
  }
}
