import { DefaultSparkGPTQuestionRepository } from './repositories/default_spark_gpt_question.repository';
import { CreateSparkGPTQuestionDto } from './entities/dtos/create_spark_gpt_question.dto';
import { UpdateSparkGPTQuestionDto } from './entities/dtos/update_spark_gpt_question.dto';
import { SparkGPTQuestionRepository } from './repositories/spark_gpt_question.repository';
import { DeleteSparkGPTQuestionDto } from './entities/dtos/delete_spark_gpt_question.dto';
import { CompanyContextRepository } from './repositories/company_context.repository';
import { BasicSparkGPTQuestion, SparkGPTQuestion } from './entities/schema';
import { CreateCompletionDto } from './entities/dtos/create_completion.dto';
import { BASIC_COMPANY_INFORMATION_QUESTION } from './entities/constants';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { WorkspaceRepository } from 'src/auth/repositories';
import { ScraperDto } from './entities/dtos/scrapper_dto';
import { RedisService } from 'src/redis/redis.service';
import { SocketType } from 'src/auth/entities/types';
import gptGatewayAPIClient from './gpt_gateway_api';
import { USERTYPE } from 'src/auth/entities';
import { convert } from 'html-to-text';
import mongoose from 'mongoose';
import * as https from 'https';
import axios from 'axios';
import { extractTextFromHTML, getGoogleDocIdFromUrl, getHTMLFromWebsite } from 'src/utils';
import { FaqsRespository } from 'src/chat/repositories/faq.respository';
import { google } from 'googleapis'

const ERRORS = {
  // use a file for this and handle with try-catch (?)
  WORKSPACE_400: { status: 400, msg: 'No data sent' },
  WORKSPACE_404: { status: 404, msg: 'No active workspace found' },
  USERTYPE_403: { status: 403, msg: 'Forbidden' },
  GENERAL_500: { status: 500, msg: 'Something went wrong' },
};

@Injectable()
export class SparkGPTService {
  constructor(
    private redisService: RedisService,
    private spark_gpt_question_repository: SparkGPTQuestionRepository,
    private default_spark_gpt_question_repository: DefaultSparkGPTQuestionRepository,
    private company_context_repository: CompanyContextRepository,
    private faq_spark_question_respoitory: FaqsRespository,
    private workspace_repository: WorkspaceRepository,
  ) {}

  private async check_if_company_context_exists(
    workspace: mongoose.Types.ObjectId,
  ) {
    return this.company_context_repository.check_exists({ workspace });
  }

  private async get_basic_company_information(
    workspace: mongoose.Types.ObjectId,
  ): Promise<BasicSparkGPTQuestion[]> {
    const workspaceData = await this.workspace_repository.get_by_id(
      String(workspace),
    );

    const basicCompanyInformation = [
      {
        workspace: workspace,
        title: BASIC_COMPANY_INFORMATION_QUESTION.COMPANY_NAME,
        answer: workspaceData.company_name,
        is_deletable: true,
      },
    ];

    return basicCompanyInformation;
  }

  private async create_company_context(
    workspace: mongoose.Types.ObjectId,
    spark_gpt_question_list: SparkGPTQuestion[],
  ) {
    const basicCompanyInformation = await this.get_basic_company_information(
      workspace,
    );
    const FaqQuestionsList = await this.faq_spark_question_respoitory.get_all({
      workspace,
    });
    const new_company_context = await gptGatewayAPIClient.get_context({
      sparkGPTQuestionList: [
        ...basicCompanyInformation,
        ...spark_gpt_question_list,
        ...FaqQuestionsList,
      ],
    });

    await this.company_context_repository.create({
      workspace,
      value: new_company_context,
    });
  }

  private async update_company_context(
    workspace: mongoose.Types.ObjectId,
    spark_gpt_question_list: SparkGPTQuestion[],
  ) {
    const basicCompanyInformation = await this.get_basic_company_information(
      workspace,
    );

    const current_company_context =
      await this.company_context_repository.get_one({ workspace });
    let website_context_data = '';
    if (current_company_context?.website_url) {
      const company_data = await this.get_company_data_by_url(
        current_company_context.website_url,
      );

      website_context_data = company_data.context;
      return this.company_context_repository.update_one(
        { workspace },
        {
          workspace,
          value: website_context_data,
        },
      );
    }

    const FaqQuestionsList = await this.faq_spark_question_respoitory.get_all({
      workspace,
    });
    const new_company_context = await gptGatewayAPIClient.get_context({
      sparkGPTQuestionList: [
        ...basicCompanyInformation,
        ...spark_gpt_question_list,
        ...FaqQuestionsList,
      ],
    });

    return this.company_context_repository.update_one(
      { workspace },
      {
        workspace,
        value: new_company_context,
      },
    );
  }

  private async update_company_context_from_website(
    workspace: mongoose.Types.ObjectId,
    url: string,
  ) {
    const company_data = await this.get_company_data_by_url(url);
    const website_context_data = company_data.context;
    const current_company_context =
      await this.company_context_repository.get_one({ workspace });

    if (current_company_context) {
      return this.company_context_repository.update_one(
        { workspace },
        {
          workspace,
          value: website_context_data,
          website_url: url,
        },
      );
    } else {
      return this.company_context_repository.create({
        workspace,
        value: website_context_data,
        website_url: url,
      });
    }
  }

  private async update_company_context_from_google_docs(
    workspace: mongoose.Types.ObjectId,
    text: string,
    url: string,
  ) {
    const company_data = await this.get_company_data_by_doc_text(text);
    const website_context_data = company_data.context;
    const current_company_context =
      await this.company_context_repository.get_one({ workspace });

    if (current_company_context) {
      return this.company_context_repository.update_one(
        { workspace },
        {
          workspace,
          value: website_context_data,
          google_docs_url: url,
        },
      );
    } else {
      return this.company_context_repository.create({
        workspace,
        value: website_context_data,
        google_docs_url: url,
      });
    }
  }

  async verify_and_update_company_context(
    client: SocketType,
    workspace: mongoose.Types.ObjectId,
  ) {
    const new_spark_gpt_question_list =
      (await this.get_all_answered_spark_gpt_question_by_workspace(client))
        ?.data ?? [];

    const updated_company_context = await this.update_company_context(
      workspace,
      new_spark_gpt_question_list,
    );
    return updated_company_context;
  }

  async import_website_data(client: SocketType, url: string) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    try {
      let context;
      if (url != '') {
        console.log('url', url);
        context = await this.update_company_context_from_website(
          new mongoose.Types.ObjectId(session.active_workspace),
          url,
        );

        console.log('context', context);
      } else {
        await this.company_context_repository.update_one(
          {
            workspace: new mongoose.Types.ObjectId(session.active_workspace),
          },
          { website_url: '' },
        );
        context = await this.verify_and_update_company_context(
          client,
          new mongoose.Types.ObjectId(session.active_workspace),
        );
      }
      return { context };
    } catch (e: any) { }
  }

  async import_google_docs(client: SocketType, url: string) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    const workspace = new mongoose.Types.ObjectId(session.active_workspace);

    return new Promise(async (resolve, reject) => {
      try {
        let context;

        if (url != '') {
          // Get ref to drive api
          const drive = google.drive({
            version: 'v3',
          });

          // Get file id
          const file_id = getGoogleDocIdFromUrl(url);

          // Get file
          const file = await drive.files.export({
            fileId: file_id,
            mimeType: 'text/plain',
            key: process.env.GOOGLE_CLOUD_API_KEY,
          });

          const file_contents = file.data as string;

          context = this.update_company_context_from_google_docs(workspace, file_contents, url);
        } else {
          await this.company_context_repository.update_one(
            {
              workspace: new mongoose.Types.ObjectId(session.active_workspace),
            },
            { google_docs_url: '' },
          );
          context = await this.verify_and_update_company_context(
            client,
            new mongoose.Types.ObjectId(session.active_workspace),
          );
        }

        resolve({ context });
      } catch (err) {
        Logger.error('error:', err);

        reject({
          error: true,
          message: 'Check the URL',
          status: 500,
        })
      }
    })
  }

  async get_context(client: SocketType) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    const result = await this.company_context_repository.get_one({
      workspace: new mongoose.Types.ObjectId(session.active_workspace),
    });
    return { context: result };
  }
  async get_completion(payload: CreateCompletionDto): Promise<string> {
    return await gptGatewayAPIClient.get_completion(payload);
  }

  async get_company_data_by_url(url: string): Promise<any> {
    const rawHTML = await getHTMLFromWebsite({ url });
    const rawData = extractTextFromHTML(rawHTML);
    console.log('rawData', rawData.text);
    const companyData: any =
      await this.create_new_company_context(rawData.text);

    return {
      context: companyData.company_context,
    };
  }

  async get_company_data_by_doc_text(text: string) {
    const companyData: any =
      await this.create_new_company_context(text);

    return {
      context: companyData.company_context,
    };
  }

  async create_new_company_context(text: string) {
    return await gptGatewayAPIClient.get_context_from_raw_data_text(text);
  }

  async create_spark_gpt_question(
    payload: CreateSparkGPTQuestionDto,
    client: SocketType,
  ) {
    const response = { data: null, error: null };
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    if (!session.active_workspace) {
      response.error = ERRORS.WORKSPACE_404;

      return response;
    }

    const workspace = new mongoose.Types.ObjectId(session.active_workspace);

    const new_spark_gpt_question =
      await this.spark_gpt_question_repository.create({
        title: payload.title,
        answer: payload.answer,
        is_deletable: true,
        workspace: workspace,
      });

    if (!new_spark_gpt_question) {
      response.error = ERRORS.GENERAL_500;

      return response;
    }

    this.verify_and_update_company_context(client, workspace);

    response.data = new_spark_gpt_question;

    return response;
  }

  async create_default_spark_gpt_question_list(client: SocketType) {
    const response = { data: null, error: null };
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    if (!session.active_workspace) {
      response.error = ERRORS.WORKSPACE_404;

      return response;
    }

    const default_question_list = await (
      await this.default_spark_gpt_question_repository.get_all({})
    )?.map((default_question) => {
      return {
        title: default_question.title,
        answer: '',
        is_deletable: false,
        workspace: new mongoose.Types.ObjectId(session.active_workspace),
      };
    });

    const new_spark_gpt_question_list =
      await this.spark_gpt_question_repository.create_many(
        default_question_list,
      );

    if (!new_spark_gpt_question_list || !new_spark_gpt_question_list?.length) {
      response.error = ERRORS.GENERAL_500;

      return response;
    }

    response.data = new_spark_gpt_question_list;

    return response;
  }

  async get_all_spark_gpt_question_by_workspace(client: SocketType) {
    const response = { data: null, error: null };

    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    if (!session.active_workspace) {
      response.error = ERRORS.WORKSPACE_404;
      return response;
    }

    const spark_gpt_question_list =
      await this.spark_gpt_question_repository.get_all({
        workspace: new mongoose.Types.ObjectId(session.active_workspace),
      });

    if (!spark_gpt_question_list) {
      response.error = ERRORS.GENERAL_500;

      return response;
    }

    if (!spark_gpt_question_list.length) {
      return await this.create_default_spark_gpt_question_list(client);
    }

    response.data = spark_gpt_question_list;

    return response;
  }

  async get_all_answered_spark_gpt_question_by_workspace(client: SocketType) {
    const response = { data: null, error: null };

    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    if (!session.active_workspace) {
      response.error = ERRORS.WORKSPACE_404;
      return response;
    }

    const answered_spark_gpt_question_list =
      await this.spark_gpt_question_repository.get_all({
        workspace: new mongoose.Types.ObjectId(session.active_workspace),
        answer: { $ne: '' },
      });

    if (!answered_spark_gpt_question_list) {
      response.error = ERRORS.GENERAL_500;

      return response;
    }
    response.data = answered_spark_gpt_question_list;

    return response;
  }

  async update_spark_gpt_question(
    payload: UpdateSparkGPTQuestionDto,
    client: SocketType,
  ) {
    const response = { data: null, error: null };

    if (client.user.type !== USERTYPE.AGENT) {
      response.error = ERRORS.USERTYPE_403;
      return response;
    }

    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    if (!session.active_workspace) {
      response.error = ERRORS.WORKSPACE_404;
      return response;
    }

    if (!payload.title && !payload.answer) {
      response.error = ERRORS.WORKSPACE_400;
      return response;
    }

    const updated_spark_gpt_question =
      await this.spark_gpt_question_repository.update_one_by_id(
        payload.id,
        payload,
      );

    if (!updated_spark_gpt_question) {
      response.error = ERRORS.GENERAL_500;

      return response;
    }

    const workspace = new mongoose.Types.ObjectId(session.active_workspace);

    this.verify_and_update_company_context(client, workspace);

    response.data = updated_spark_gpt_question;

    return response;
  }

  async delete_spark_gpt_question(
    payload: DeleteSparkGPTQuestionDto,
    client: SocketType,
  ) {
    const response = { data: null, error: null };

    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    if (!session.active_workspace) {
      response.error = ERRORS.WORKSPACE_404;
      return response;
    }

    const deleted_spark_gpt_question =
      await this.spark_gpt_question_repository.delete_by_id(payload.id);

    if (!deleted_spark_gpt_question) {
      response.error = ERRORS.GENERAL_500;
    }

    const workspace = new mongoose.Types.ObjectId(session.active_workspace);

    this.verify_and_update_company_context(client, workspace);

    response.data = deleted_spark_gpt_question;

    return response;
  }

  async getTextFromWebsite(dto: ScraperDto) {
    const pattern = /^((http|https|ftp):\/\/)/;
    let final_url = dto.url;
    if (!pattern.test(dto.url)) {
      final_url = 'https://' + dto.url;
    }
    try {
      const options = {
        wordwrap: 130,
      };
      const httpsAgent = new https.Agent({ keepAlive: true });
      const { data: html } = await axios.get(final_url, {
        httpsAgent,
        params: {
          cat_id: '876',
        },
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });

      let text = convert(html, options);
      text = text.replace(/ *\[[^\]]*\] */g, '');
      if (text.length > 3900) {
        text = text.slice(0, 3901);
      }

      return { text };
    } catch (e: any) {
      throw new HttpException(
        'failed to get text please check url',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getMainColorFromHTML(html: string) {
    try {
      const regex = /#(?!000000|FFFFFF)[0-9a-f]{6}/gi;

      const countMap = {};
      const hexArray = html.match(regex);

      if (!hexArray) return;

      const filteredHexArray = [...new Set(hexArray)].forEach((hex) => {
        countMap[hex] = countMap[hex] ? countMap[hex] + 1 : 1;
      });

      let mostRepeatedHex = filteredHexArray?.[0];
      let maxCount = countMap?.[mostRepeatedHex];

      Object.entries(countMap).forEach(([hex, count]) => {
        if (count > maxCount) {
          mostRepeatedHex = hex;
          maxCount = count;
        }
      });
      const mainColor = mostRepeatedHex;

      return mainColor;
    } catch (e: any) {
      throw new HttpException(
        'failed to get main color please check url',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
