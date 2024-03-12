import { CreateSparkGPTQuestionDto } from './entities/dtos/create_spark_gpt_question.dto';
import { DeleteSparkGPTQuestionDto } from './entities/dtos/delete_spark_gpt_question.dto';
import { UpdateSparkGPTQuestionDto } from './entities/dtos/update_spark_gpt_question.dto';
import { SocketAuthGuard } from 'src/auth/entities/guard';
import { SparkGPTService } from './spark_gpt.service';
import { EventDto } from './entities/dtos/event.dto';
import { SocketType } from 'src/auth/entities/types';
import { UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebSiteImportDto } from './entities/dtos/website_import.dto';

@WebSocketGateway()
export class SparkGPTGateWay {
  constructor(private sparkGPTService: SparkGPTService) {}
  @WebSocketServer()
  server: Server;

  // @UseGuards(SocketAuthGuard)
  @SubscribeMessage('add_spark_gpt_question')
  async handleAddSparkGPTQuestion(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<CreateSparkGPTQuestionDto>,
  ) {
    return await this.sparkGPTService.create_spark_gpt_question(
      data.payload,
      client,
    );
  }

  // @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_spark_gpt_question_list')
  async handleGetSparkGPTQuestionList(@ConnectedSocket() client: SocketType) {
    return await this.sparkGPTService.get_all_spark_gpt_question_by_workspace(
      client,
    );
  }

  @SubscribeMessage('import_website_data')
  async handleImportWebsiteData(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<WebSiteImportDto>,
  ) {
    console.log(' data', data);
    return await this.sparkGPTService.import_website_data(
      client,
      data.payload.url,
    );
  }

  @SubscribeMessage('import_google_doc')
  async handleImportGoogleDoc(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<WebSiteImportDto>,
  ) {
    console.log(' data', data);
    return await this.sparkGPTService.import_google_docs(
      client,
      data.payload.url,
    );
  }

  @SubscribeMessage('get_context')
  async handleGetCompanyContext(@ConnectedSocket() client: SocketType) {
    return await this.sparkGPTService.get_context(client);
  }

  // @UseGuards(SocketAuthGuard)
  @SubscribeMessage('update_spark_gpt_question')
  async handleUpdateSparkGPTQuestion(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<UpdateSparkGPTQuestionDto>,
  ) {
    return await this.sparkGPTService.update_spark_gpt_question(
      data.payload,
      client,
    );
  }

  // @UseGuards(SocketAuthGuard) to be restored when refresktoken works correctly
  @SubscribeMessage('delete_spark_gpt_question')
  async handleDeleteSparkGPTQuestion(
    @ConnectedSocket() client: SocketType,
    @MessageBody() data: EventDto<DeleteSparkGPTQuestionDto>,
  ) {
    return await this.sparkGPTService.delete_spark_gpt_question(
      data.payload,
      client,
    );
  }
}
