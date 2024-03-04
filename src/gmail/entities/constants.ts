export const GMAIL_THREAD_END_POINT = (email: string) =>
  `https://gmail.googleapis.com/gmail/v1/users/${email}/threads`;

export const GMAIL_DELETE_MESSAGE_ENDPOINT = (
  email: string,
  messageId: string,
) =>
  `https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${messageId}`;

export const GMAIL_THREAD_DETAILS_ENDPOINT = (
  email: string,
  thread_id: string,
) =>
  `https://gmail.googleapis.com/gmail/v1/users/${email}/threads/${thread_id}`;

export const GMAIL_ATTACHMENT_END_POINT = (
  userEmail: string,
  messageId: string,
  attachmentId: string,
) =>
  `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/${messageId}/attachments/${attachmentId}`;
