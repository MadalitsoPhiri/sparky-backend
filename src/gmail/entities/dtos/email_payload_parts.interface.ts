export interface EmailPayloadPartsInterface {
  partId: string;
  mimeType: string;
  filename: string;
  headers: { [key: string]: string }[];
  body: {
    [key: string]: string;
  };
  parts: EmailPayloadPartsInterface[];
}
