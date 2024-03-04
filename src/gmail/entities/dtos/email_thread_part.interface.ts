interface BodyObject {
  data?: string;
  attachmentId?: string;
}

export interface EmailThreadPart {
  id?: string;
  mimeType?: string;
  string?: string;
  body?: BodyObject;
  parts?: EmailThreadPart[];
}
