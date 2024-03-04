import { Module } from '@nestjs/common';
import { ErrorHandlingGateway } from './error-handling.gateway';
import { ErrorHandlingService } from './error-handling.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ErrorHandlingGateway, ErrorHandlingService],
  exports: [ErrorHandlingGateway, ErrorHandlingService],
})
export class ErrorHandlingModule {}
