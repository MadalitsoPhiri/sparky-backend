import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { getUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/entities/guard';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { IntegrationsService } from './integrations.service';
import { ConnectTwilioCredsDto } from 'src/sms/dto/connect-twillio-creds.dto';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @UseGuards(JwtGuard)
  @Post()
  connectTwilio(
    @Body() integrationData: ConnectTwilioCredsDto | { [key: string]: any },
    @getUser() user: JwtPayload,
  ) {
    return this.integrationsService.createIntegration(integrationData, user);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.integrationsService.findAll();
  }
}
