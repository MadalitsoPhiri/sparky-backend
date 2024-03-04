import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ANONYMOUS_NAMESPACE } from 'src/auth/entities';
import { SparkGPTService } from 'src/spark-gpt/spark_gpt.service';
import { SocketType } from '../auth/entities/types';
import Event from '../auth/entities/types/event';

@WebSocketGateway({ namespace: ANONYMOUS_NAMESPACE })
export class AnonymousNamespaceGateWay {
  constructor(private sparkGPTService: SparkGPTService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('scrape_url_for_company_data')
  async handleScrapeUrl(
    @MessageBody() event: Event,
    @ConnectedSocket() client: SocketType,
  ) {
    const companyData = await this.sparkGPTService.get_company_data_by_url(
      event.data,
    );

    this.server
      .to(client.id)
      .emit('update_landing_page_company_data', companyData);
  }

  @SubscribeMessage('send_landing_page_message')
  async handleSendMessage(
    @MessageBody() event: Event,
    @ConnectedSocket() client: SocketType,
  ) {
    const completion = await this.sparkGPTService.get_completion(event.data);

    this.server.to(client.id).emit('update_landing_page_conversation', {
      completion: completion,
    });
  }
}
