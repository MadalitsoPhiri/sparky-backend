export class SendSmsDto {
  to: string[];
  from?: string;
  body: string;
}
