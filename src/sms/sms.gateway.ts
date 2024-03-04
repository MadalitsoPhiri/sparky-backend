import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SmsGateway {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  @WebSocketServer()
  server: Server;
}
