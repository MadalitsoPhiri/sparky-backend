import { CreateCompanyContextDto } from '../entities/dtos/create_company_context.dto';
import { CreateCompletionDto } from '../entities/dtos/create_completion.dto';
import axios from 'axios';
import { FullCompanyDataFromRawDataDto } from '../entities/dtos/full_company_data_from_raw_data.dto';

class GPTGatewayAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get_completion(data: CreateCompletionDto): Promise<string> {
    const url = `${this.baseUrl}/api/completion`;

    const response = await axios.post(url, data);

    return response.data.completion;
  }

  async get_context(data: any): Promise<string> {
    const url = `${this.baseUrl}/api/context`;

    const response = await axios.post(url, data);

    return response.data.company_context;
  }

  async get_full_company_data_from_raw_data(
    data: string,
  ): Promise<FullCompanyDataFromRawDataDto> {
    const url = `${this.baseUrl}/api/full-company-data-from-raw-data`;
    const response = await axios.post(url, { rawData: data });

    return response.data.company_data;
  }

  async get_context_from_raw_data(data: string): Promise<string> {
    const url = `${this.baseUrl}/api/context-from-raw-data`;
    const response = await axios.post(url, { rawData: data });

    return response.data.company_context;
  }

  async get_context_from_raw_data_text(data: string): Promise<string> {
    const url = `${this.baseUrl}/api/full-company-data-from-raw-data-text`;
    const response = await axios.post(url, { rawData: data });

    return response.data;
  }

  async get_prompt_suggestion_list_from_context(
    data: string,
  ): Promise<string[]> {
    const url = `${this.baseUrl}/api/prompt-suggestion-list-from-context`;
    const response = await axios.post(url, { context: data });

    return response.data.prompt_suggestion_list;
  }

  async get_conversation_starter_list_from_context(
    data: string,
  ): Promise<string[]> {
    const url = `${this.baseUrl}/api/conversation-starter-list-from-context`;
    const response = await axios.post(url, { context: data });

    return response.data.conversation_starter_list;
  }
}

const gptGatewayAPIClient = new GPTGatewayAPIClient(
  process.env.GPT_GATEWAY_API_URL,
);

export default gptGatewayAPIClient;
