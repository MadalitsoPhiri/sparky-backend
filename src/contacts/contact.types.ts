import mongoose from 'mongoose';

export enum ContactsQueryTypes {
  LEADS = 'leads',
  USERS = 'users',
  NEW = 'new',
  ACTIVE = 'active',
}

export type ContactsQuery =
  | ContactsQueryTypes.LEADS
  | ContactsQueryTypes.USERS
  | ContactsQueryTypes.ACTIVE
  | ContactsQueryTypes.NEW;

export interface ContactsFilter {
  workspace: mongoose.Types.ObjectId;
  query?: ContactsQuery;
}

export type RequiredContactCSVData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  company_website: string;
};
