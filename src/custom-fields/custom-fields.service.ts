import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { CustomFieldContactRepository } from 'src/contact-custom-fields/repository';
import { RedisService } from 'src/redis/redis.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomFieldsRepository } from './respository';

@Injectable()
export class CustomFieldsService {
  constructor(
    private custom_fields_repository: CustomFieldsRepository,
    private redisService: RedisService,
    private custom_field_contact_repository: CustomFieldContactRepository,
  ) {}
  async create(user: JwtPayload, createCustomFieldDto: CreateCustomFieldDto) {
    const active_workspace = await this.get_active_workspace(user);
    return await this.custom_fields_repository.create({
      ...createCustomFieldDto,
      workspace_id: new mongoose.Types.ObjectId(active_workspace).toString(),
    });
  }

  async findOne(field: string) {
    return await this.custom_fields_repository.get_one({ field });
  }

  async findAll(user: JwtPayload) {
    const active_workspace = await this.get_active_workspace(user);
    return await this.custom_fields_repository.get_all({
      workspace_id: new mongoose.Types.ObjectId(active_workspace).toString(),
    });
  }

  async findOneById(id: string) {
    return await this.custom_fields_repository.get_by_id(id);
  }

  async update(id: number, updateCustomFieldDto: UpdateCustomFieldDto) {
    return `This action updates a #${id} customField`;
  }

  async remove(id: string) {
    await this.custom_field_contact_repository.delete_many({
      custom_field_id: new mongoose.Types.ObjectId(id),
    });

    return await this.custom_fields_repository.delete_by_id(id);
  }

  async get_active_workspace(user: JwtPayload) {
    const session = await this.redisService.get_session(
      user.sub,
      user.session_id,
    );
    return session.active_workspace;
  }
}
