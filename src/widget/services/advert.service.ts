import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { USERTYPE } from 'src/auth/entities';
import { SocketType } from 'src/auth/entities/types';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { WidgetConfigRepository } from 'src/auth/repositories';
import { RedisService } from 'src/redis/redis.service';
import {
  AdvertWidgetDto,
  UpdateAdvertWidgetDto,
} from '../dto/advertisement.dto';
import { AdvertisementsRepository } from '../repositories/advertisements.repository';
import { SurveyRepository } from '../repositories/survey.repositories';

@Injectable()
export class AdvertService {
  constructor(
    private redis_service: RedisService,
    private advertisements_repository: AdvertisementsRepository,
    private survey_repository: SurveyRepository,
    private widget_config_repository: WidgetConfigRepository,
  ) {}

  async createAdvert(data: AdvertWidgetDto, client: SocketType) {
    const active_workspace = await this.get_active_workspace(
      client.user as JwtPayload,
    );
    const widget_config_result = await this.widget_config_repository.get_by_id(
      data.widgetId,
    );
    delete data.widgetId;
    const advert = await this.advertisements_repository.create({
      workspace: new mongoose.Types.ObjectId(active_workspace),
      widget_config: new mongoose.Types.ObjectId(widget_config_result._id),
      ...data,
    });
    return {
      data: advert,
      error: null,
    };
  }

  async findAllAdverts(client: SocketType) {
    let adverts = [];
    if (client.user.type == USERTYPE.AGENT) {
      const active_workspace = await this.get_active_workspace(
        client.user as JwtPayload,
      );
      adverts = await this.advertisements_repository.get_all({
        workspace: new mongoose.Types.ObjectId(active_workspace),
      });
    } else if (client.user.type == USERTYPE.CLIENT) {
      adverts = await this.advertisements_repository.get_all({
        widget_config: new mongoose.Types.ObjectId(client.user.widget_id),
      });
    }

    return {
      data: adverts,
      error: null,
    };
  }

  findAdvert(client: SocketType) {
    return `This action returns a #${client} widget`;
  }

  removeAdvert(payload: any) {
    const removedAdvert = this.advertisements_repository.delete_by_id(
      payload.data,
    );
    return {
      data: removedAdvert,
      error: null,
    };
  }

  async update(data: UpdateAdvertWidgetDto) {
    const survey = await this.advertisements_repository.update_one_by_id(
      data.id,
      data,
    );
    return {
      data: survey,
      error: null,
    };
  }

  async get_active_workspace(user: JwtPayload) {
    const session = await this.redis_service.get_session(
      user.sub,
      user.session_id,
    );
    return session.active_workspace;
  }
}
