import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { UserRepository } from 'src/auth/repositories';
import { RedisService } from 'src/redis/redis.service';
import { ListContactDto } from '../dto/list.dto';
import { ListRepository } from '../repositories/list.repository';

@Injectable()
export class ListService {
  constructor(
    private user_repository: UserRepository,
    private list_repository: ListRepository,
    private redisService: RedisService,
  ) {}

  async create(createListContact: ListContactDto, user: JwtPayload) {
    const active_workspace = await this.get_active_workspace(user);
    return await this.list_repository.create({
      name: createListContact.name,
      contact_ids: createListContact.contacts,
      workspace_id: new mongoose.Types.ObjectId(active_workspace).toString(),
    });
  }

  async update(id: string, data: any) {
    const contact_ids = (await this.list_repository.get_by_id(id)).contact_ids;
    data.contacts = [...new Set([...contact_ids, ...data.contacts])];
    return await this.list_repository.update_one_by_id(id, data);
  }

  async findAll(user: JwtPayload) {
    const active_workspace = await this.get_active_workspace(user);
    return await this.list_repository.get_all({
      workspace_id: new mongoose.Types.ObjectId(active_workspace).toString(),
    });
  }

  async findOne(id: string) {
    return await this.user_repository.get_by_id(id);
  }

  async remove(id: string) {
    return await this.list_repository.delete_by_id(id);
  }

  async get_active_workspace(user: JwtPayload) {
    const session = await this.redisService.get_session(
      user.sub,
      user.session_id,
    );
    return session.active_workspace;
  }
}
