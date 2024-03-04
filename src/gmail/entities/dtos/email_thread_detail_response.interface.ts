import { EmailThreadDetailMessageInterface } from './email_thread_detail_message.interface';

export interface EmailThreadResponseInterface {
  id: string;
  historyId: string;
  messages: EmailThreadDetailMessageInterface[];
  userEmail: string;
}
