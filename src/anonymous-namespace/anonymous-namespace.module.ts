import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AnonymousNamespaceGateWay } from './anonymous-namespace.gateway';
import { SparkGPTService } from 'src/spark-gpt/spark_gpt.service';
import { SparkGPTQuestionRepository } from 'src/spark-gpt/repositories/spark_gpt_question.repository';
import { DefaultSparkGPTQuestionRepository } from 'src/spark-gpt/repositories/default_spark_gpt_question.repository';
import { CompanyContextRepository } from 'src/spark-gpt/repositories/company_context.repository';
import { WorkspaceRepository } from 'src/auth/repositories';
import { WorkSpaces, WorkSpacesSchema } from 'src/auth/entities';
import {
  CompanyContext,
  CompanyContextSchema,
  DefaultSparkGPTQuestion,
  DefaultSparkGPTQuestionSchema,
  SparkGPTQuestion,
  SparkGPTQuestionSchema,
} from 'src/spark-gpt/entities/schema';
import { FaqsRespository } from 'src/chat/repositories/faq.respository';
import { FaqSchema, Faqs } from 'src/chat/entities/schema';

@Global()
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
    AnonymousNamespaceGateWay,
    FaqsRespository,
  ],
  exports: [],
})
export class AnonymousNamespaceModule {}
