export enum USERTYPE {
  AGENT = 'AGENT',
  CLIENT = 'CLIENT',
  BOT = 'BOT',
}


export enum COMPANY_SIZE {
  XXS = 'XXS',
  XS = 'XS',
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
  XL = 'XL',
  XXL = 'XXL',
}
export enum COOKIES {
  AUTH = 'uid',
  CLIENT_AUTH = 'client_uid',
}
export const get_agents_room_id = (root_account_id: string) =>
  `${root_account_id}:agents`;
export const generate_session_key = (id: string) => `SESSIONS:${id}`;
export enum CONVERSATION_ACCESS {
  ALL = 'ALL',
  ASSIGNED_ONLY = 'ASSIGNED_ONLY',
  ASSIGNED_TO_TEAM = 'ASSIGNED_TO_TEAM',
  UNASSIGNED = 'UNASSIGNED',
}

export enum USER_PROPERTIES {
  USER_NAME = 'user_name',
  WORKSPACE = 'workspace',
  CUSTOM_FIELDS = 'custom_fields',
  EMAIL = 'email',
  PASSWORD = 'password',
  PROFILE_PICTURE_URL = 'profile_picture_url',
  USER_NUMBER = 'user_number',
  TYPE = 'type',
  FIRST_SEEN = 'first_seen',
  LAST_SEEN = 'last_seen',
  SIGNUP_DATE = 'signup_date',
  LAST_HEARD = 'last_heard',
  LAST_CLICKED_LINK = 'last_clicked_link',
  BROWSER_LANG = 'browser_lang',
  BROWSER = 'browser',
  DEVICE = 'device',
  DEVICE_PLATFORM = 'device_platform',
  PHONE_NUMBER = 'phone_number',
  LAST_CONTACTED = 'last_contacted',
  LAST_OPENED_EMAIL = 'last_opened_email',
  WHATSAPP_NUMBER = 'whatsapp_number',
  TWITTER_FOLLOWERS = 'twitter_followers',
  LAST_KNOWN_LOCATION = 'last_known_location',
  OWNER = 'owner',
  CITY = 'city',
  COUNTRY = 'country',
  JOB_TITLE = 'job_title',
  BIO = 'bio',
  AWAY = 'away',
  HOST_URL = 'host_url',
  CONTACT_TYPE = 'contact_type',
  USER_ID = 'user_id',
  COMPANY_NAME = 'company_name',
  COMPANY_WEBSITE = 'company_website',
  COMPANY_SIZE = 'company_size',
  COMPANY_INDUSTRY = 'company_industry',
  VERIFIED = 'verified',
  IS_BLOCKED = 'is_blocked',
  VERIFICATION_CODE = 'verification_code',
}

export const ANONYMOUS_NAMESPACE = '/anonymousNamespace';
