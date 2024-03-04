import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CONVERSATION_ACCESS } from '../constants';
import { Users } from './user';
import { WorkSpaces } from './workspaces.schema';
import { WorkSpaceTeamMates } from './workspace_team_mates.schema';

@Schema({ _id: false })
export class InboxPermissions extends Document {
  @Prop({ type: Boolean, default: false })
  can_reassign_conversations_and_edit_lead_or_user_ownership: boolean;
  @Prop({ type: Boolean, default: false })
  can_delete_replies_and_notes_from_a_conversation: boolean;
  @Prop({ type: Boolean, default: false })
  can_manage_views: boolean;
  @Prop({ type: Boolean, default: false })
  can_manage_rules: boolean;
  @Prop({ type: Boolean, default: false })
  can_manage_round_robin_assignment: boolean;
  @Prop({
    enum: [
      CONVERSATION_ACCESS.ALL,
      CONVERSATION_ACCESS.ASSIGNED_ONLY,
      CONVERSATION_ACCESS.ASSIGNED_TO_TEAM,
      CONVERSATION_ACCESS.UNASSIGNED,
    ],
    default: CONVERSATION_ACCESS.ALL,
  })
  coversation_access: string;
}

@Schema({ _id: false })
export class SettingsPermissions extends Document {
  @Prop({ type: Boolean, default: false })
  can_access_general_and_security_settings: boolean;
  @Prop({ type: Boolean, default: false })
  can_manage_team_mates_and_permissions: boolean;
  @Prop({ type: Boolean, default: false })
  can_access_widget_configuration: boolean;
  @Prop({ type: Boolean, default: false })
  can_access_billing_settings: boolean;
  @Prop({ type: Boolean, default: false })
  can_access_outbound_settings: boolean;
  @Prop({ type: Boolean, default: false })
  can_edit_default_sender_address: boolean;
  @Prop({ type: Boolean, default: false })
  can_manage_tags: boolean;
  @Prop({ type: Boolean, default: false })
  can_manage_contacts: boolean;
  @Prop({ type: Boolean, default: false })
  can_access_lead_and_user_profile_pages: boolean;
}

@Schema({ _id: false })
export class ArticlePermissions extends Document {
  @Prop({ type: Boolean, default: false })
  can_manage_articles: boolean;
}

@Schema({ _id: false })
export class DataPermissions extends Document {
  @Prop({ type: Boolean, default: false })
  can_export_company_data: boolean;
  @Prop({ type: Boolean, default: true })
  can_import_company_data: boolean;
}

export const InboxPermissionsSchema =
  SchemaFactory.createForClass(InboxPermissions);
export const ArticlePermissionsSchema =
  SchemaFactory.createForClass(ArticlePermissions);
export const DataPermissionsSchema =
  SchemaFactory.createForClass(DataPermissions);
export const SettingsPermissionsSchema =
  SchemaFactory.createForClass(SettingsPermissions);

@Schema()
export class WorkSpacePermissions extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WorkSpaceTeamMates.name })
  team_mate: WorkSpaceTeamMates;
  @Prop({ type: InboxPermissionsSchema, default: () => ({}) })
  inbox_permissions: InboxPermissions;
  @Prop({ type: SettingsPermissionsSchema, default: () => ({}) })
  settings_permissions: SettingsPermissions;
  @Prop({ type: DataPermissionsSchema, default: () => ({}) })
  data_permissions: DataPermissions;
  @Prop({ type: ArticlePermissionsSchema, default: () => ({}) })
  article_permissions: ArticlePermissions;
}

export const WorkSpacePermissionsSchema =
  SchemaFactory.createForClass(WorkSpacePermissions);
