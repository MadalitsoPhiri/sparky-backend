import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { SocketType } from 'src/auth/entities/types';
import { ChatService } from 'src/chat/chat.service';
import { USERTYPE } from '../constants';
import Event from '../types/event';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: SocketType = context.switchToWs().getClient();
    const payload: Event = context.switchToWs().getData();
    return this.checkIfAuthenticated(client, payload);
  }
  async checkIfAuthenticated(
    client: SocketType,
    payload: any,
  ): Promise<boolean> {
    if (client.user.type == USERTYPE.AGENT) {
      try {
        await this.authService.verifyAccessToken(client.user.token);
        Logger.log('token  valid for user', client.user);

        return true;
      } catch (e) {
        Logger.log('token not valid for user', client.user);
        await this.authService.queueEvent(client, payload);
        client.emit('auth_error', payload);
        return false;
      }
    } else if (client.user.type == USERTYPE.CLIENT) {
      return true;
    } else {
      return false;
    }
  }
}
