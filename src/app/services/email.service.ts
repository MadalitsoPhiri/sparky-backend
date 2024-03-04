import { Injectable } from '@nestjs/common';
import * as nodeMailer from 'nodemailer';

interface ConstructorOption {
  templateDir: string;
  transporter: nodeMailer.Transporter;
}

interface EmailOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text: string;
  html?: string;
  template?: string;
  namespace?: string;
}

interface EmailService {
  sendEmail: (options: EmailOptions) => Promise<any>;
  options: ConstructorOption;
}

@Injectable()
export class GmailEmailService implements EmailService {
  options: ConstructorOption;
  constructor() {
    this.options = {
      templateDir: 'src/app/templates',
      transporter: nodeMailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      }),
    };
  }

  async sendEmail(options: EmailOptions) {
    //TODO: add template engine
    //TODO: remove text and html options
    return await this.options.transporter.sendMail({
      from: `"${options.namespace}" ${process.env.EMAIL_USER}`, // sender address
      to: options.to.split(',').join(','), // list of receivers
      cc: options.cc ? options.cc.split(',').join(',') : undefined, // list of receivers
      bcc: options.bcc ? options.bcc.split(',').join(',') : undefined, // list of receivers
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}
