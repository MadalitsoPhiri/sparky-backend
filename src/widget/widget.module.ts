import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WidgetConfig,
  WidgetConfigSchema,
  WorkSpaces,
  WorkSpacesSchema,
} from 'src/auth/entities';
import { WidgetConfigRepository } from 'src/auth/repositories';
import { RedisService } from 'src/redis/redis.service';
import {
  Advertisements,
  AdvertisementsSchema,
} from './entities/advertisement.entity';
import { Survey, SurveySchema } from './entities/survey.entity';
import { AdvertGateway } from './gateways/advert.gateway';
import { SurveyGateway } from './gateways/survey.gateway';
import { AdvertisementsRepository } from './repositories/advertisements.repository';
import { SurveyRepository } from './repositories/survey.repositories';
import { AdvertService } from './services/advert.service';
import { SurveyService } from './services/survey.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Advertisements.name,
        schema: AdvertisementsSchema,
      },
      {
        name: Survey.name,
        schema: SurveySchema,
      },
      {
        name: WidgetConfig.name,
        schema: WidgetConfigSchema,
      },
      {
        name: WorkSpaces.name,
        schema: WorkSpacesSchema,
      },
    ]),
  ],
  providers: [
    AdvertisementsRepository,
    SurveyRepository,
    AdvertGateway,
    SurveyGateway,
    AdvertService,
    SurveyService,
    RedisService,
    WidgetConfigRepository,
  ],
  exports: [AdvertService, SurveyService],
})
export class WidgetModule {}
