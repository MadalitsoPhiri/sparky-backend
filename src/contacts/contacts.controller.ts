import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as csvParser from 'csv-parser';
import { Request } from 'express';
import { getUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/entities/guard';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { GmailEmailService } from '../app/services/email.service';
import { ContactsQueryTypes, RequiredContactCSVData } from './contact.types';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateAssignedContactsDto } from './dto/update-assigned-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private emailService: GmailEmailService,
  ) {}

  @UseGuards(JwtGuard)
  @Post()
  create(
    @getUser() user: JwtPayload,
    @Body() createContactDto: CreateContactDto,
  ) {
    return this.contactsService.create(createContactDto, user);
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @getUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const results: RequiredContactCSVData[] = [];
      const { buffer, mimetype } = file;

      if (mimetype !== 'text/csv') {
        throw new HttpException(
          'Invalid file type. Please upload a csv file',
          HttpStatus.BAD_REQUEST,
        );
      }

      // TODO: check if file is empty
      // TODO: check if file is valid csv
      // TODO: check file size

      await new Promise<void>((resolve, reject) => {
        const stream = new StreamableFile(buffer)
          .getStream()
          .pipe(csvParser())
          .on('data', (data: RequiredContactCSVData) => {
            stream.pause();
            try {
              const newData = Object.keys(data).reduce((acc, key) => {
                const value = data[key].replaceAll("'", '');
                const _key = key
                  .trim()
                  .replaceAll(' ', '_')
                  .replaceAll("'", '')
                  .toLowerCase();
                acc[_key] = value.trim();
                return acc;
              }, {} as RequiredContactCSVData);

              results.push(newData);
            } finally {
              stream.resume();
            }
          })
          .on('error', (error) => reject(error))
          .on('close', () => resolve());
      });
      const json = this.contactsService.upload(results, user);
      return json;
    } catch (error) {
      throw new HttpException(
        'error message here',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(
    @getUser() user: JwtPayload,
    @Req()
    req: Request<
      null,
      null,
      null,
      {
        query: ContactsQueryTypes;
        search: string;
        list: string;
        operator: string;
        key: string;
        value: string;
      }
    >,
  ) {
    return this.contactsService.findAll(user, req.query);
  }

  @UseGuards(JwtGuard)
  @Get('my-contacts')
  async getMyContacts(@getUser() user: JwtPayload) {
    return await this.contactsService.findMyContacts(user);
  }

  @UseGuards(JwtGuard)
  @Put('assign')
  async updateAssignedContact(@getUser() user: JwtPayload, @Body() body: any) {
    const { contact } = body;
    const { email } = user;

    const assignedContact = {
      contact,
      created_at: new Date(),
      updated_at: null,
    };
    const dto: UpdateAssignedContactsDto = {
      contact: { ...assignedContact },
    };

    const response = await this.contactsService.updateAssignment(email, dto);

    return response;
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const response = await this.contactsService.update(id, updateContactDto);
    return response;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }

  @UseGuards(JwtGuard)
  @Post('send-mail')
  async sendEmail(@getUser() user: JwtPayload, @Body() body: any) {
    const { to, cc, bcc, subject, text } = body;
    // TODO: add template engine
    // TODO: block other users from sending email
    const response = await this.emailService.sendEmail({
      to,
      subject,
      text,
      cc,
      bcc,
      namespace: 'SparkHub',
    });
    if (!response) {
      return { message: 'email not sent' };
    }
    return { message: 'email sent' };
  }

  @Post('join-wait-list')
  async joinWaitList(@Body() body: any) {
    const { email, url } = body;

    const alreadyExists = await this.contactsService.findWaitingListByEmail(
      email,
    );
    if (alreadyExists) return { message: 'Email already exists' };

    const text = `
Hi SparkHub Team,
New user has joined the waitlist.
Email: ${email}
Thanks,
SparkHub
    `;
    const response = await this.emailService.sendEmail({
      to: 'system@sparknspur.com',
      subject: 'New user joined waitlist',
      text,
      namespace: 'SparkHub',
    });
    if (!response) {
      return { message: 'email not sent' };
    }
    try {
      await this.contactsService.createWaitingList({
        email,
        url,
      });
      return { message: 'Email sent: Thank you' };
    } catch (error) {
      throw new HttpException(
        'error message here',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('waiting-list')
  async getWaitingList() {
    const waitingList = await this.contactsService.findAllWaitingList();
    return waitingList;
  }

  @UseGuards(JwtGuard)
  @Post('assign')
  async assignContact(@getUser() user: JwtPayload, @Body() body: any) {
    const { contact } = body;
    const { email } = user;

    const assignedContact = {
      email: contact,
      created_at: new Date(),
      updated_at: null,
    };

    const response = await this.contactsService.createAssignment({
      email,
      contact: [{ ...assignedContact }],
    });

    return response;
  }

  @Get('assign')
  async getAssignedContacts() {
    return await this.contactsService.findAllContactsAssignment();
  }
}
