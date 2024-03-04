import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { USERTYPE } from 'src/auth/entities';
import { SocketType } from 'src/auth/entities/types';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { WidgetConfigRepository } from 'src/auth/repositories';
import { RedisService } from 'src/redis/redis.service';
import { SurveyWidgetDto, UpdateSurveyWidgetDto } from '../dto/survey.dto';
import { SurveyRepository } from '../repositories/survey.repositories';

@Injectable()
export class SurveyService {
  constructor(
    private redis_service: RedisService,
    private survey_repository: SurveyRepository,
    private widget_config_repository: WidgetConfigRepository,
  ) {}

  async create(data: SurveyWidgetDto, client: SocketType) {
    const active_workspace = await this.get_active_workspace(
      client.user as JwtPayload,
    );
    const widget_config_result = await this.widget_config_repository.get_by_id(
      data.widgetId,
    );
    delete data.widgetId;
    const survey = await this.survey_repository.create({
      workspace: new mongoose.Types.ObjectId(active_workspace),
      widget_config: new mongoose.Types.ObjectId(widget_config_result._id),
      ...data,
    });
    return {
      data: survey,
      error: null,
    };
  }

  async findAll(client: SocketType) {
    let surveys = [];
    if (client.user.type == USERTYPE.AGENT) {
      const active_workspace = await this.get_active_workspace(
        client.user as JwtPayload,
      );
      surveys = await this.survey_repository.get_all({
        workspace: new mongoose.Types.ObjectId(active_workspace),
      });
    } else if (client.user.type == USERTYPE.CLIENT) {
      surveys = await this.survey_repository.get_all({
        widget_config: new mongoose.Types.ObjectId(client.user.widget_id),
      });
    }

    return {
      data: surveys,
      error: null,
    };
  }

  async find(id: string) {
    const surveys = await this.survey_repository.get_by_id(id);
    return {
      data: surveys,
      error: null,
    };
  }

  remove(id: string) {
    const removedSurvey = this.survey_repository.delete_by_id(id);
    return {
      data: removedSurvey,
      error: null,
    };
  }

  async update(data: UpdateSurveyWidgetDto) {
    const survey = await this.survey_repository.update_one_by_id(data.id, data);
    return {
      data: survey,
      error: null,
    };
  }

  async set_active(data: UpdateSurveyWidgetDto) {
    // get active survey
    const active_survey = await this.survey_repository.get_all({
      is_active: true,
      workspace: new mongoose.Types.ObjectId(data.workspace_id),
      widget_config: new mongoose.Types.ObjectId(data.widgetId),
    });

    if (active_survey.length > 0) {
      await this.survey_repository.update_one_by_id(active_survey[0]._id, {
        is_active: false,
      });
    }

    const survey = await this.survey_repository.update_one_by_id(data.id, {
      is_active: data.is_active,
    });

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
