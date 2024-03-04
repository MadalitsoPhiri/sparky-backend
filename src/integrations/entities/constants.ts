import { ConfigService } from '@nestjs/config';

export enum INTEGRATION_NAMES {
  TWILIO = 'Twilio',
  OUTLOOK = 'Outlook',
  GOOGLE = 'Google',
}
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GET_OAUTH2_URL = (config: ConfigService) =>
  `https://accounts.google.com/o/oauth2/v2/auth?scope=${GMAIL_SCOPE}%20https://www.googleapis.com/auth/userinfo.email&response_type=code&client_id=${config.get(
    'CLIENT_ID',
  )}&redirect_uri=${config.get(
    'REDIRECT_URI',
  )}&include_granted_scopes=true&state=pass-through%20value&access_type=offline`;
export const GOOGLE_TOKEN_ENDPOINT_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_PROFILE_ENDPOINT_URL = (access_token: string) =>
  `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`;
export const GET_GOOGLE_TOKEN_ENDPOINT_URL = (code, config: ConfigService) =>
  `${GOOGLE_TOKEN_ENDPOINT_URL}?client_id=${config.get(
    'CLIENT_ID',
  )}&client_secret=${config.get(
    'CLIENT_SECRET',
  )}&code=${code}&response_type=token&redirect_uri=${config.get(
    'REDIRECT_URI',
  )}&grant_type=authorization_code`;

export const getTokenParams = (code: string, config: ConfigService) => {
  const params = new URLSearchParams();
  params.append('client_id', config.get('CLIENT_ID'));
  params.append('client_secret', config.get('CLIENT_SECRET'));
  params.append('code', code);
  params.append('response_type', 'token');
  params.append('redirect_uri', config.get('REDIRECT_URI'));
  params.append('grant_type', 'authorization_code');
  return params;
};

export const getRefreshTokenParams = (
  refresh_token: string,
  config: ConfigService,
) => {
  const params = new URLSearchParams();
  params.append('client_id', config.get('CLIENT_ID'));
  params.append('client_secret', config.get('CLIENT_SECRET'));
  params.append('refresh_token', refresh_token);
  params.append('access_type', 'offline');
  params.append('grant_type', 'refresh_token');
  return params;
};
