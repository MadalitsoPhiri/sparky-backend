import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ReceiveSmsDto {
  @IsNotEmpty()
  @IsString()
  // A 34 character unique identifier for the message. May be used to later retrieve this message from the REST API.
  public MessageSid: string;

  @IsNotEmpty()
  @IsString()
  // Same value as MessageSid. Deprecated and included for backward compatibility.
  public SmsSid: string;

  @IsNotEmpty()
  @IsString()
  // The 34 character id of the Account this message is associated with.
  public AccountSid: string;

  @IsNotEmpty()
  @IsString()
  // The 34 character id of the Messaging Service associated with the message.
  public MessagingServiceSid: string;

  @IsNotEmpty()
  @IsString()
  // The phone number or Channel address that sent this message.
  public From: string;

  @IsNotEmpty()
  // The phone number or Channel address of the recipient.
  public To: string;

  @IsNotEmpty()
  @IsString()
  // The text body of the message. Up to 1600 characters long.
  public Body: string;

  @IsNotEmpty()
  @IsNumber()
  // The number of media items associated with your message.
  public NumMedia: number;

  @IsOptional()
  // The ContentTypes for the Media stored at MediaUrl{N}. The order of MediaContentType{N} matches the order of MediaUrl{N}. If more than one media element is indicated by NumMedia than MediaContentType{N} will be used, where N is the zero-based index of the Media (e.g. MediaContentType0).
  public MediaContentType?: any;
  @IsOptional()
  // A URL referencing the content of the media received in the Message. If more than one media element is indicated by NumMedia than MediaUrl{N} will be used, where N is the zero-based index of the Media.
  public MediaUrl?: any;

  @IsString()
  @IsOptional()
  // The city of the sender.
  public FromCity?: string;

  @IsString()
  @IsOptional()
  // The state or province of the sender.
  public FromState?: string;

  @IsString()
  @IsOptional()
  // The postal code of the called sender.
  public FromZip?: string;

  @IsString()
  @IsOptional()
  // The country of the called sender.
  public FromCountry?: string;

  @IsString()
  @IsOptional()
  // The city of the recipient.
  public ToCity?: string;

  @IsString()
  @IsOptional()
  // The state or province of the recipient.
  public ToState?: string;

  @IsString()
  @IsOptional()
  // The postal code of the recipient.
  public ToZip?: string;

  @IsString()
  @IsOptional()
  // The country of the recipient.
  public ToCountry?: string;
}
