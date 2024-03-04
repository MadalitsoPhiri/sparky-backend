import { EmailPayloadPartsInterface } from './email_payload_parts.interface';

export interface EmailThreadDetailMessageInterface {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: EmailPayloadPartsInterface;
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
  parts?: EmailPayloadPartsInterface[];
}
