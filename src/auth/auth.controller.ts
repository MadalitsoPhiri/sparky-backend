import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto, SocialLoginDto, Users } from './entities';
import { Response, Request } from 'express';
import {
  ForgotPassword,
  PasswordReset,
  TempSignUp,
} from './entities/dto/temp_signup.dto';
import { JwtGuard } from './entities/guard';
import { getUser } from './decorators';
import JwtPayload from './entities/types/jwt.payload';
import { ChangeWorkSpaceDto } from './entities/dto/change_workspace.dto';
import { DeleteWorkSpaceDto } from './entities/dto/delete_workspace.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.service.signup(dto, res);
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.service.login(
      {
        email: dto.email,
        password: dto.password,
      },
      res,
    );
  }

  @HttpCode(200)
  @Post('social-login')
  async socialLogin(
    @Body() dto: SocialLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authType = dto.type;
    if (!authType) {
      throw new HttpException(
        'Please provide the oauth provider',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.service.socialLogin(
      {
        email: dto.email,
        type: authType,
      },
      res,
    );
  }

  @Get('refresh_token')
  async refreshtoken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.service.refreshtoken(req, res);
  }

  // @Get('verify_session')
  // async verifySession(
  //   @Req() req: Request,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   return this.service.verifySession(req, res);
  // }

  @Delete('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.service.logout(req, res);
  }

  @Post('forgot-password')
  async forgot_password(@Req() req: Request<null, undefined, ForgotPassword>) {
    return this.service.forgot_password(req);
  }

  @Post('reset-password')
  async reset_password(@Body() dto: PasswordReset) {
    return this.service.reset_password(dto);
  }

  @UseGuards(JwtGuard)
  @Get('get_widget_config')
  async get_widget_config(@getUser() user: JwtPayload) {
    return await this.service.get_widget_config(user);
  }

  @UseGuards(JwtGuard)
  @Post('change_active_workspace_data')
  async change_active_workspace_data(
    @getUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
    @Body() workspace_payload: ChangeWorkSpaceDto,
  ) {
    return await this.service.handle_change_active_workspace_data(
      user,
      workspace_payload,
      res,
    );
  }

  @UseGuards(JwtGuard)
  @Delete('delete_workspace/:id')
  async delete_workspace(
    @getUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
    @Param() params: DeleteWorkSpaceDto,
  ) {
    return await this.service.handle_delete_workspace(params.id, user);
  }
  @Post('temp_client_signup')
  async temp_signup(
    @Body() widget_id: TempSignUp,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.service.temp_signup(widget_id, res);
  }
}
