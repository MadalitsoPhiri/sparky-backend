import { Injectable } from '@nestjs/common';
import { ErrorHandlingGateway } from './error-handling.gateway';

@Injectable()
export class ErrorHandlingService {
  constructor(private error_handling_gateway: ErrorHandlingGateway) {}

  async emitErrorEventToDashboard(workspaceId: string, message: string) {
    this.error_handling_gateway.server.to(workspaceId).emit('error_warning', {
      data: { error: { message: message } },
    });
  }
}
