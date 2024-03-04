import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClusterType } from '@node-redis/client';
import { createClient } from 'redis';
import { USERTYPE, generate_session_key } from 'src/auth/entities';
import { SocketType, User } from 'src/auth/entities/types';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import {
  ASYNC_CONFIG_TOKEN,
  AsyncConfig,
  GetListOptions,
  REFRESH_TOKEN_KEY,
} from './entities';

@Injectable()
export class RedisService {
  client: any | RedisClusterType;
  connected = false;
  constructor(
    @Inject(ASYNC_CONFIG_TOKEN) config: AsyncConfig,
    private configService: ConfigService,
  ) {
    this.client = createClient({
      url: config.url,
      username: config.username,
      password: config.password,
    });
    this.client.on('error', (err: Error) =>
      console.log('Redis Client Error', err),
    );
    this.connect();
  }

  private async connect() {
    if (!this.connected) {
      try {
        await this.client.connect();
        this.connected = true;
        console.log(
          '[RedisService:INFO]: RedisService Connected to redis server.',
        );

        return this;
      } catch (e) {
        console.log('[RedisService:Error]: Failed to connect to redis server.');
        console.log('REdis Eror', e);
      }
    }
  }

  async save(key: string, value: any, path: '.') {
    if (typeof value === 'boolean') {
      return this.processSaveOperation(key, value, path);
    }
    throw new Error('value Must be defined.');
  }

  async find(key: string, path = '.') {
    if (typeof key === 'string') {
      return this.processFindOperation(key, path);
    }
    throw new Error('key Must be of type string.');
  }

  private async processSaveOperation(key: string, value: any, path: string) {
    switch (typeof value) {
      case 'object':
        return this.saveObject(key, path, value);

      case 'string':
        return this.saveString(key, value);

      case 'boolean':
        return this.saveString(key, value.toString());

      case 'number':
        return this.saveString(key, value.toString());
      default:
        throw new Error(
          'value must be one of the following => string,object,boolean or number',
        );
    }
  }

  private static replacer(key: string, value: any) {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    }
    return value;
  }

  private static reviver(key: string, value: any) {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }

  private async processPushListOperation(key: string, value: any) {
    switch (typeof value) {
      case 'object': {
        if (value instanceof Map) {
          const payload = JSON.stringify(value, RedisService.replacer);
          return this.client.lPush(key, payload);
        }
        const payload = JSON.stringify(value);
        return this.client.lPush(key, payload);
      }

      case 'string': {
        return this.client.lPush(key, value);
      }

      case 'boolean': {
        return this.client.lPush(key, value.toString());
      }

      case 'number': {
        return this.client.lPush(key, value.toString());
      }

      default:
        throw new Error(
          'value must be one of the following => string,object,boolean or number',
        );
    }
  }

  async delete(key: string) {
    await this.client.del(key);
  }

  private async processFindOperation(key: string, path: string) {
    try {
      const result = await this.client.json.get(key, { path });
      return result;
    } catch (e) {
      console.log('Find operation failure: ', e.message);
    }
    try {
      const result = await this.client.get(key);
      return result;
    } catch (e) {
      //...
    }

    return Promise.resolve(null);
  }

  async saveObject(key: string, path: string, value: any) {
    await this.client.del(key);
    return this.client.json.set(key, path, value);
  }

  async updateObject(key: string, path: string, value: any) {
    return this.client.json.set(key, path, value);
  }

  async saveString(key: string, value: string) {
    await this.client.del(key);
    return this.client.set(key, value);
  }

  async PushList(key: string, value: any) {
    await this.processPushListOperation(key, value);
  }

  async PopList(key: string, value: any) {
    return this.client.lPop(key, value);
  }

  async getList(key: string, options?: GetListOptions) {
    if (options) {
      const { skip, size } = options;
      if (skip && size) {
        const [length, list] = await Promise.all([
          this.client.lLen(key),
          this.client.lRange(key, skip, skip + size - 1),
        ]);
        return Promise.resolve({
          size: length,
          data: list,
        });
      }
      if (skip && !size) {
        const [length, list] = await Promise.all([
          this.client.lLen(key),
          this.client.lRange(key, skip, -1),
        ]);
        return Promise.resolve({
          size: length,
          data: list,
        });
      }
      if (size && !skip) {
        const [length, list] = await Promise.all([
          this.client.lLen(key),
          this.client.lRange(key, 0, size - 1),
        ]);
        return Promise.resolve({
          size: length,
          data: list,
        });
      }
      const [length, list] = await Promise.all([
        this.client.lLen(key),
        this.client.lRange(key, 0, -1),
      ]);
      return Promise.resolve({
        size: length,
        data: list,
      });
    }
    const [length, list] = await Promise.all([
      this.client.lLen(key),
      this.client.lRange(key, 0, -1),
    ]);
    return Promise.resolve({
      size: length,
      data: list,
    });
  }

  async getItemFromList(key: string, index: number) {
    return this.client.lRange(key, index, index);
  }
  async get_list_size(key: string) {
    return this.client.lLen(key);
  }
  async set_list_item(key: string, value: string) {
    return this.client.lPush(key, value);
  }
  async server_online_clean() {
    // `[online_status]:${id}`,
    // this.configService.get('SERVER_NAME'),
    const online_users = await this.client.hGetAll(
      `${this.configService.get('SERVER_NAME')}:online_users`,
    );
    Object.keys(online_users).map(async (item) => {
      await this.remove_current_server_online_user(item);
      await this.clear_current_server_online_status(item);
    });

    const online_users_1 = await this.client.hGetAll(
      `${this.configService.get('SERVER_NAME')}:online_users`,
    );
  }
  async add_current_server_online_user(
    id: string,
    socket_id: string,
    session_user: SocketType,
  ) {
    const user = await this.client.hGet(
      `${this.configService.get('SERVER_NAME')}:online_users`,
      id,
    );
    if (!user) {
      if (session_user.user.type === USERTYPE.AGENT) {
        this.client.hSet(
          `${this.configService.get('SERVER_NAME')}:online_users`,
          id,
          session_user.user.session_id,
        );
      } else if (session_user.user.type === USERTYPE.CLIENT) {
        this.client.hSet(
          `${this.configService.get('SERVER_NAME')}:online_users`,
          id,
          `${session_user.user.widget_id}:${id}`,
        );
      }
    }
  }
  async remove_current_server_online_user(id: string) {
    return this.client.hDel(
      `${this.configService.get('SERVER_NAME')}:online_users`,
      id,
    );
  }
  async get_hash_size(key: string) {
    return this.client.hLen(key);
  }
  async current_server_set_status_online(
    id: string,
    socket_id: string,
    session_user: SocketType,
  ) {
    const isonline = await this.check_is_online(id);
    if (!isonline) {
      await this.set_status_online(id, session_user);
    }
    if (session_user.user.type === USERTYPE.AGENT) {
      return this.client.hSet(
        `${this.configService.get('SERVER_NAME')}:[online_status]:${id}`,
        socket_id,
        session_user.user.session_id,
      );
    } else if (session_user.user.type === USERTYPE.CLIENT) {
      return this.client.hSet(
        `${this.configService.get('SERVER_NAME')}:[online_status]:${id}`,
        socket_id,
        `${session_user.user.widget_id}:${id}`,
      );
    }
  }
  async set_status_online(id: string, session_user: SocketType) {
    if (session_user.user.type === USERTYPE.AGENT) {
      const set_online_result = await this.client.hSet(
        `[online_status]:${id}`,
        this.configService.get('SERVER_NAME'),
        session_user.user.session_id,
      );
      return set_online_result;
    } else if (session_user.user.type === USERTYPE.CLIENT) {
      const set_online_result = await this.client.hSet(
        `[online_status]:${id}`,
        this.configService.get('SERVER_NAME'),
        `${session_user.user.widget_id}:${id}`,
      );
      return set_online_result;
    }
  }

  async set_status_offline(id: string) {
    const result = await this.client.hDel(
      `[online_status]:${id}`,
      this.configService.get('SERVER_NAME'),
    );
  }
  async clear_current_server_online_status(id: string) {
    return await this.client.del(
      `${this.configService.get('SERVER_NAME')}:[online_status]:${id}`,
    );
  }
  async current_server_set_status_offline(id: string, socket_id: string) {
    // await this.client.del();
    const final_result = await this.client.hDel(
      `${this.configService.get('SERVER_NAME')}:[online_status]:${id}`,
      socket_id,
    );
    const result = await this.current_server_check_is_online(id);

    if (!result) {
      await this.set_status_offline(id);
      await this.remove_current_server_online_user(id);
    }
    return final_result;
  }
  async check_is_online(id: string) {
    const result = await this.get_hash_size(`[online_status]:${id}`);
    if (result > 0) {
      return true;
    } else {
      return false;
    }
  }

  async current_server_check_is_online(id: string) {
    const result = await this.get_hash_size(
      `${this.configService.get('SERVER_NAME')}:[online_status]:${id}`,
    );
    if (result > 0) {
      return true;
    } else {
      return false;
    }
  }
  async setRefreshToken(key: string, id: string, value: string) {
    return this.client.hSet(`${REFRESH_TOKEN_KEY}:${id}`, key, value);
  }
  async create_session(
    id: string,
    session_id: string,
    value: { active_workspace: string; refresh_token: string },
  ) {
    const session_key = generate_session_key(id);

    return this.client.hSet(session_key, session_id, JSON.stringify(value));
  }
  async get_session(
    id: string,
    session_id: string,
  ): Promise<{ active_workspace: string; refresh_token: string }> {
    const session_key = generate_session_key(id);
    const result = await this.client.hGet(session_key, session_id);
    if (result) {
      return JSON.parse(result);
    } else {
      return result;
    }
  }
  async get_all_sessions(id: string) {
    const session_key = generate_session_key(id);
    const result = await this.client.hGetAll(session_key);
    if (result) {
      return result;
    } else {
      return result;
    }
  }
  async delete_session(id: string, session_id: string) {
    const session_key = generate_session_key(id);
    const result = await this.client.hDel(session_key, session_id);
    return result;
  }
  async delete_all_sessions(id: string) {
    const session_key = generate_session_key(id);
    return this.client.del(session_key);
  }
  async delete_refresh_token(key: string, id: string) {
    return this.client.hDel(`${REFRESH_TOKEN_KEY}:${id}`, key);
  }

  async getRefreshToken(key: string, id: string) {
    return this.client.hGet(`${REFRESH_TOKEN_KEY}:${id}`, key);
  }
  async get_user_session_size(id: string) {
    return this.get_hash_size(`${REFRESH_TOKEN_KEY}:${id}`);
  }

  async get_active_workspace(user: JwtPayload | User) {
    const session = await this.get_session(user.sub, user.session_id);
    return session?.active_workspace;
  }
}
