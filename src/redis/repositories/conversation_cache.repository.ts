import { Injectable } from '@nestjs/common';
import { Conversations } from 'src/chat/entities/schema';
import { RedisService } from '../redis.service';

@Injectable()
export class ConversationsCacheRepository {
  constructor(private redis_service: RedisService) {}
  async check_exists(id: string) {
    const result = await this.redis_service.find(id, '.');
    if (result) return true;
    return false;
  }

  async get_cached_conversation(id: string) {
    return await this.redis_service.find(id, '.');
  }

  async cache_conversation(id: string, conversation: Conversations) {
    return await this.redis_service.saveObject(id, '.', conversation);
  }
  async update_cached_conversation(id: string, conversation: Conversations) {
    return await this.redis_service.updateObject(id, '.', conversation);
  }

  async delete_cached_conversation(id: string) {
    return await this.redis_service.client.del(id);
  }
}
