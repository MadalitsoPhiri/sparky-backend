import { DefaultSparkGPTQuestionRepository } from './repositories/default_spark_gpt_question.repository';
import { SparkGPTQuestionRepository } from './repositories/spark_gpt_question.repository';
import { WorkSpaces, WorkSpacesSchema } from 'src/auth/entities';
import { WorkspaceRepository } from 'src/auth/repositories';
import { SparkGPTGateWay } from './spark_gpt.gateway';
import { SparkGPTService } from './spark_gpt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import {
  SparkGPTQuestion,
  SparkGPTQuestionSchema,
  DefaultSparkGPTQuestion,
  DefaultSparkGPTQuestionSchema,
} from './entities/schema';
import {
  CompanyContext,
  CompanyContextSchema,
} from './entities/schema/company_context';
import { CompanyContextRepository } from './repositories/company_context.repository';
import { FaqsRespository } from 'src/chat/repositories/faq.respository';
import { FaqSchema, Faqs } from 'src/chat/entities/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WorkSpaces.name,
        schema: WorkSpacesSchema,
      },
      {
        name: DefaultSparkGPTQuestion.name,
        schema: DefaultSparkGPTQuestionSchema,
      },
      {
        name: SparkGPTQuestion.name,
        schema: SparkGPTQuestionSchema,
      },
      {
        name: CompanyContext.name,
        schema: CompanyContextSchema,
      },
      {
        name: Faqs.name,
        schema: FaqSchema,
      },
    ]),
  ],
  providers: [
    SparkGPTService,
    WorkspaceRepository,
    SparkGPTQuestionRepository,
    DefaultSparkGPTQuestionRepository,
    CompanyContextRepository,
    FaqsRespository,
    SparkGPTGateWay,
  ],
  exports: [SparkGPTService],
})
export class SparkGPTModule {}
