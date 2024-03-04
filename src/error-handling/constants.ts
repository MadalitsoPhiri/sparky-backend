export enum ERROR_MESSAGES {
  MISSING_DATA = "Couldn't proceed due to missing data",

  CONVERSATION_NOT_CREATED = 'Conversation could not be created',

  INVALID_EMAIL = 'Invalid email provided: ',
  NO_VALID_EMAIL = 'No valid email was provided',
  INVITATION_CONFLICT = 'Invitation already sent',

  SMS_FAILED_FOR = 'Could not send SMS to: ',
  SMS_INTEGRATION_NOT_FOUND = 'Could not find Twilio integration',
  SMS_INTEGRATION_ALREADY_EXISTS = 'Twilio integration already exists',
}
