import { Socket } from 'socket.io';

export interface User {
  sub?: string;
  email?: string;
  phone_number?: string;
  iat?: number;
  exp?: number;
  token?: string;
  refresh_token?: string;
  session_id?: string;
  user_id?: string;
  type: string;
  widget_id?: string;
}
export type SocketType = Socket & { user: User };
