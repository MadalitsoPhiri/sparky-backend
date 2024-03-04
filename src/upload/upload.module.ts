import { Module } from '@nestjs/common';
import { UploadGateway } from './upload.gateway';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  providers: [UploadService, UploadGateway],
  controllers: [UploadController],
})
export class UploadModule {}
