import { HttpException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '../redis/redis.module';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';
import { ChatModule } from 'src/chat/chat.module';
import { CustomFieldContactModule } from 'src/contact-custom-fields/contact-custom-field.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { CustomFieldsModule } from 'src/custom-fields/custom-fields.module';
import { EmailModule } from 'src/email/email.module';
import { ErrorHandlingModule } from 'src/error-handling/error-handling.module';
import { GmailModule } from 'src/gmail/gmail.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import { SmsModule } from 'src/sms/sms.module';
import { SparkGPTModule } from 'src/spark-gpt/spark_gpt.module';
import { TagsModule } from 'src/tags/tags.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { UploadModule } from 'src/upload/upload.module';
import { WidgetModule } from 'src/widget/widget.module';
import { AnonymousNamespaceModule } from '../anonymous-namespace/anonymous-namespace.module';
import { AuthModule } from '../auth/auth.module';

const appModules = [
  ConfigModule.forRoot({ isGlobal: true, cache: false }),
  RedisModule.forRootAsync({
    inject: [ConfigService],
    import: [],
    useFactory: (config: ConfigService) => ({
      url: config.get('REDIS_SERVER_URL'),
      username: config.get('REDIS_USERNAME'),
      password: config.get('REDIS_PASSWORD'),
    }),
  }),
  MongooseModule.forRootAsync({
    useFactory: (config: ConfigService) => ({
      uri: config.get('MONGODB_URI'),
    }),
    inject: [ConfigService],
  }),
  AuthModule,
  ChatModule,
  ContactsModule,
  CustomFieldsModule,
  WidgetModule,
  UploadModule,
  EmailModule,
  SparkGPTModule,
  AnonymousNamespaceModule,
  IntegrationsModule,
  SmsModule,
  ErrorHandlingModule,
  GmailModule,
  TasksModule,
  CustomFieldContactModule,
  ActivityLogsModule,
  TagsModule,
];
const providers = [];

if (process.env.SENTRY_DSN_URL) {
  appModules.push(RavenModule);
  providers.push({
    provide: APP_INTERCEPTOR,
    useValue: new RavenInterceptor({
      filters: [
        {
          type: HttpException,
          filter: (exception: HttpException) => 500 > exception.getStatus(),
        },
      ],
    }),
  });
}

@Module({
  imports: appModules,
  controllers: [],
  providers,
})
export class AppModule {}
