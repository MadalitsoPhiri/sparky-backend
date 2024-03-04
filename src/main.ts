import { config } from 'dotenv';
config();
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { sparky_cors_options } from './app/utilities/cors.options';
import { AuthenticatedSocketIoAdapter } from './auth/auth.socketio.adapter';
import { RedisService } from './redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.SENTRY_DSN_URL) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN_URL,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
  }
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const config = app.get<ConfigService>(ConfigService);
  const redis = app.get<RedisService>(RedisService);
  await redis.server_online_clean();
  app.enableCors({
    origin: sparky_cors_options(config),
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
  });
  app.useWebSocketAdapter(new AuthenticatedSocketIoAdapter(app));
  app.use(cookieParser(config.get('REFRESH_TOKEN_SECRET')));
  const port = config.get('PORT') || 8080;
  await app.listen(port);
}
bootstrap();
