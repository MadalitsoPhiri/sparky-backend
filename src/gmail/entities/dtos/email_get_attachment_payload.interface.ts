export interface EmailGetAttachmentPayload {
  event_name: 'get_attachment';
  data: { messageId: string; attachmentId: string };
}
