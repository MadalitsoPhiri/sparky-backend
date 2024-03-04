import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodeMailer from 'nodemailer';
import { EmailOptions } from './entities/types/email_options';

@Injectable()
export class EmailService {
  private transporter: nodeMailer.Transporter;
  constructor(private config: ConfigService) {
    this.transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.get('EMAIL_USER'),
        pass: config.get('EMAIL_PASSWORD'),
      },
    });
  }
  async send_email(options: EmailOptions) {
    //TODO: add template engine
    //TODO: remove text and html options
    return await this.transporter.sendMail({
      from: `"${options.namespace}" ${this.config.get('EMAIL_USER')}`, // sender address
      to: options.to.split(',').join(','), // list of receivers
      cc: options.cc ? options.cc.split(',').join(',') : undefined, // list of receivers
      bcc: options.bcc ? options.bcc.split(',').join(',') : undefined, // list of receivers
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}
