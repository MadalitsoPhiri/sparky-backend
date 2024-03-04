import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { WorkSpaces } from './workspaces.schema';
import { INVITATION_STATUS } from '../types/invitation_status';
import { Users } from './user';

@Schema()
export class WorkSpaceTeamMateInvitations extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WorkSpaces.name })
  workspace: WorkSpaces;
  @Prop({
    enum: [
      INVITATION_STATUS.ACCEPTED,
      INVITATION_STATUS.EXPIRED,
      INVITATION_STATUS.PENDING,
    ],
    default: INVITATION_STATUS.PENDING,
  })
  status: INVITATION_STATUS;
  @Prop({ max: 50, default: null })
  email: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Users.name })
  inviter: Users;
  @Prop({ type: Date, default: null })
  expiry_date: Date;
}

export const WorkSpaceTeamMatesInvitationSchema = SchemaFactory.createForClass(
  WorkSpaceTeamMateInvitations,
);
