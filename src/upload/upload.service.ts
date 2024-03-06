import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { UploadDto } from './entities/dtos/upload.dto';
import { DeleteDto } from './entities/dtos/delete.dto';
import { SocketType } from 'src/auth/entities/types';
import { USERTYPE } from 'src/auth/entities';
import { Stream } from 'stream';

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {}
  async handleBufferUpload(file: Uint8Array, file_name: string) {
    return new Promise<string>((resolve, reject) => {
      const storage = new Storage({
        keyFilename: './service-key.json',
      });
      const bucket = storage.bucket(this.config.get('GCLOUD_STORAGE_BUCKET'));
      const blob = bucket.file(file_name);

      const blobStream = blob.createWriteStream({
        resumable: false,
      });
      blobStream
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          resolve(publicUrl);
        })
        .on('error', () => {
          reject('Unable to upload image, something went wrong');
        })
        .end(file);
    });
  }
  async handle_upload(client: SocketType, payload: UploadDto) {
    try {
      const response = await this.handleBufferUpload(
        payload.file,
        `${
          client.user.type === USERTYPE.AGENT
            ? client.user.sub
            : client.user.user_id
        }-${payload.file_name}`,
      );
      return {
        error: false,
        message: 'Succesfully uploaded file',
        payload: { url: response },
        status: 200,
      };
    } catch (e: any) {
      return { error: true, message: 'Failed to upload file', status: 500 };
    }
  }

  async handleStreamUpload(stream: Stream, file_name: string) {
    return new Promise<string>((resolve, reject) => {
      const storage = new Storage({
        keyFilename: './service-key.json',
      });
      const bucket = storage.bucket(this.config.get('GCLOUD_STORAGE_BUCKET'));
      const blob = bucket.file(file_name);

      const blobStream = blob.createWriteStream({
        resumable: false,
      });
      stream.pipe(blobStream);
      blobStream
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve(publicUrl);
        })
        .on('error', (e) => {
          reject('Unable to upload image, something went wrong');
        });
    });
  }

  async handleDeleteFile(payload: DeleteDto) {
    return new Promise((resolve, reject) => {
      const storage = new Storage({
        keyFilename: './service-key.json',
      });
      const bucket = storage.bucket(this.config.get('GCLOUD_STORAGE_BUCKET'));
      const blob = bucket.file(payload.file_name);
      blob
        .delete()
        .then(() => {
          resolve({
            error: false,
            message: 'Succesfully deleted file',
            status: 200,
          });
        })
        .catch((err) => {
          reject({
            error: true,
            message: 'Failed to delete file',
            status: 500,
          });
        });
    });
  }
}
