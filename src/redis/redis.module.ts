import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AsyncOptions, ASYNC_CONFIG_TOKEN } from './entities';
import { ChatModule } from 'src/chat/chat.module';
import { ChatService } from 'src/chat/chat.service';

@Module({})
export class RedisModule {
  static async forRoot(url: string): Promise<DynamicModule> {
    const configOptionsProvider: Provider = {
      useValue: { url },
      provide: ASYNC_CONFIG_TOKEN,
    };

    return {
      module: RedisModule,
      providers: [configOptionsProvider, RedisService],
      exports: [configOptionsProvider, RedisService],
      global: true,
    };
  }

  static async forRootAsync(options: AsyncOptions): Promise<DynamicModule> {
    const configOptionsProvider: Provider = {
      inject: options.inject,
      useFactory: options.useFactory,
      provide: ASYNC_CONFIG_TOKEN,
    };
    return {
      imports: [...options.import],
      module: RedisModule,
      providers: [configOptionsProvider, RedisService],
      exports: [configOptionsProvider, RedisService],
      global: true,
    };
  }
}
