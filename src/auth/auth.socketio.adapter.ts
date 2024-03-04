import { Storage } from '@google-cloud/storage';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import * as ss from 'socket.io-stream';
import { sparky_cors_options } from 'src/app/utilities/cors.options';
import { UploadService } from 'src/upload/upload.service';
import { URL } from 'url';
import { AuthService } from './auth.service';
import { ANONYMOUS_NAMESPACE, USERTYPE } from './entities';
import { SocketType, User } from './entities/types';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  private readonly authService: AuthService;
  private readonly config: ConfigService;
  private readonly upload_service: UploadService;
  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
    this.config = this.app.get(ConfigService);
    this.upload_service = this.app.get(UploadService);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    let user_token_info: User;
    const storage = new Storage({
      keyFilename: './service-key.json',
    });
    const bucket = storage.bucket(this.config.get('GCLOUD_STORAGE_BUCKET'));
    const uploadService = new UploadService(this.config);
    const server: Server = super.createIOServer(port, {
      ...options,
      pingInterval: 10000,
      cors: {
        origin: sparky_cors_options(this.config),
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
      },
    });

    server.of(ANONYMOUS_NAMESPACE);

    server.on('connection', function (socket) {
      ss(socket).on('file', async (stream, data, callback) => {
        try {
          const result = await uploadService.handleStreamUpload(
            stream,
            data.name,
          );
          callback({ url: result });
        } catch (e: any) {
          callback({ url: null, error: true, error_message: e.message });
        }
      });
    });

    server.use(async (socket: SocketType, next) => {
      if (socket.handshake.headers.type === USERTYPE.AGENT) {
        // agent dashboard attempting connection
        const token = socket.handshake.headers.authorization;

        try {
          user_token_info = await this.authService.verifyAccessToken(token);

          socket.user = {
            ...user_token_info,
            token,
            type: socket.handshake.headers.type,
          };

          // update last seen field here
          next();
        } catch (e) {
          next(new Error('Forbidden'));
        }
      } else if (socket.handshake.headers.type === USERTYPE.CLIENT) {
        // end user chatbot widget client attempting connection
        if (socket.handshake.headers['widget-id']) {
          const COOKIE_NAME = socket.handshake.headers['widget-id'] as string;
          const result = await this.authService.check_if_widget_exists(
            COOKIE_NAME,
          );

          if (!result) {
            Logger.log('widget not found.');
            next(new Error('Forbidden'));
          } else {
            const cleaned_origins = result.allowed_origins.map((url) => {
              try {
                const domain = new URL(url);
                return domain.origin;
              } catch (e: any) {
                Logger.log('error', e);
              }
            });
            // check host origin is allowed
            if (cleaned_origins.length > 0) {
              if (
                !cleaned_origins.includes(
                  socket.handshake.headers['widget-host-origin'] as string,
                )
              ) {
                Logger.log('host origin not allowed');
                next(new Error('Forbidden'));
              }
            }

            if (socket.handshake.headers[COOKIE_NAME]) {
              // has cookie, read values to determine who the user is
              const result = await this.authService.check_if_user_exists(
                socket.handshake.headers[COOKIE_NAME] as string,
              );
              if (!result) {
                next(new Error('user_not_found'));
              } else {
                socket.user = {
                  user_id: socket.handshake.headers[COOKIE_NAME] as string,
                  type: socket.handshake.headers.type,
                  widget_id: COOKIE_NAME,
                };
                Logger.debug(
                  'user_id now online',
                  socket.handshake.headers[COOKIE_NAME as string] as string,
                );
                next();
                // update last seen field here
              }
            } else {
              Logger.log('no cookie provided');

              next(new Error('no_cookie'));
            }
          }
        } else {
          Logger.log('no widget_id provided');
          next(new Error('Forbidden'));
        }
      } else {
        Logger.log('client not supported provided');
        next(new Error('Forbidden'));
      }
    });

    return server;
  }
}
