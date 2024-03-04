import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { CONTACT_TYPE } from 'src/contacts/constants';
import { USERTYPE } from '../constants';
import { WorkSpaces } from './workspaces.schema';

@Schema({ _id: false })
export class UserLocation {
  @Prop({ type: String, default: null })
  longitude: string;
  @Prop({ type: String, default: null })
  latitude: string;
}

const UserLocationSchema = SchemaFactory.createForClass(UserLocation);

@Schema({ _id: false })
export class UserCustomField {
  @Prop({ type: String, default: null })
  value: string;
  @Prop({ type: String, default: null })
  field: string;
}

const customFieldSchema = SchemaFactory.createForClass(UserCustomField);

@Schema({
  timestamps: true,
})
export class Users extends Document {
  @Prop({ default: null })
  user_name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: WorkSpaces.name,
    default: null,
  })
  workspace: WorkSpaces;

  @Prop({
    type: Object,
    default: null,
  })
  custom_fields: any;

  @Prop({ max: 225, default: null })
  email: string;

  @Prop({
    min: 8,
    default: null,
  })
  password: string;

  @Prop({ type: String, default: null })
  profile_picture_url: string;

  @Prop({ type: Number, default: null })
  user_number: number;

  @Prop({
    enum: [USERTYPE.AGENT, USERTYPE.CLIENT, USERTYPE.BOT],
    default: USERTYPE.CLIENT,
  })
  type: string;

  @Prop({ type: Date, default: null })
  first_seen: Date;

  @Prop({ type: Date, default: null })
  last_seen: Date;

  @Prop({ type: Date, default: null })
  signup_date: Date;

  @Prop({ type: Date, default: null })
  last_heard: Date;

  @Prop({ type: Date, default: null })
  last_clicked_link: Date;

  @Prop({ type: String, default: null })
  browser_lang: string;

  @Prop({ type: String, default: null })
  browser: string;

  @Prop({ type: String, default: null })
  device: string;

  @Prop({ type: String, default: null })
  device_platform: string;

  @Prop({ type: String, default: null })
  phone_number: string;

  @Prop({ type: String, default: null })
  status: string;

  @Prop({ type: Date, default: null })
  last_contacted: Date;

  @Prop({ type: Date, default: null })
  last_opened_email: Date;

  @Prop({ type: String, default: null })
  whatsapp_number: string;

  @Prop({ type: String, default: null })
  twitter_followers: string;

  @Prop({ type: UserLocationSchema, default: () => ({}) })
  last_known_location: UserLocation;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Users.name, default: null })
  owner: Users;

  @Prop({ type: String, default: null })
  city: string;

  @Prop({ type: String, default: null })
  country: string;

  @Prop({ type: String, default: null })
  job_title: string;

  @Prop({ type: String, default: null })
  bio: string;

  @Prop({ type: Boolean, default: null })
  away: boolean;

  @Prop({ type: String, default: null })
  host_url: string;

  @Prop({
    enum: [CONTACT_TYPE.LEAD, CONTACT_TYPE.USER, null],
    default: CONTACT_TYPE.LEAD,
  })
  contact_type: string;

  @Prop({ type: String, default: null })
  user_id: string;

  @Prop({ type: String, default: null })
  company_name: string;

  @Prop({ type: String, default: null })
  company_website: string;

  @Prop({ type: String, default: null })
  company_size: string;

  @Prop({ type: String, default: null })
  company_industry: string;

  @Prop({ type: Boolean, default: null })
  verified: boolean;

  @Prop({ type: Boolean, default: null })
  is_blocked: boolean;

  @Prop({ type: String, default: null })
  verification_code: string;
}

export const usersSchema = SchemaFactory.createForClass(Users);
