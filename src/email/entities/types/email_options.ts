import { EmailAttachment } from './attachments.interface';

export interface EmailOptions {
  subject?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  text?: string;
  html?: string;
  template?: string;
  namespace?: string;
  data?: any;
  attachments?: EmailAttachment[];

  inReplyTo?: string;
  replyTo?: string;
}
