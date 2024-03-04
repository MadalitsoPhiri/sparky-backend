// WorkSpaceTeamMateInvitations
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AnyKeys,
  AnyObject,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { WorkSpaceTeamMateInvitations } from '../entities/schema/work_space_invitation.schema';

@Injectable()
export class WorkSpaceInvitationRepository extends BaseRepository<WorkSpaceTeamMateInvitations> {
  delete_one(
    filter: FilterQuery<WorkSpaceTeamMateInvitations>,
    options?: QueryOptions<WorkSpaceTeamMateInvitations>,
  ): Promise<any> {
    return this.workspace_invitation_model.deleteOne(filter, options).exec();
  }
  constructor(
    @InjectModel(WorkSpaceTeamMateInvitations.name)
    private workspace_invitation_model: Model<WorkSpaceTeamMateInvitations>,
  ) {
    super();
  }
  async get_all(
    filter: FilterQuery<WorkSpaceTeamMateInvitations>,
    projection: ProjectionType<WorkSpaceTeamMateInvitations> = {},
  ): Promise<WorkSpaceTeamMateInvitations[]> {
    return this.workspace_invitation_model
      .find(filter, projection)
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .populate({
        path: 'inviter',
        select:
          '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
      })
      .exec();
  }
  async get_by_id(id: string): Promise<WorkSpaceTeamMateInvitations> {
    //TODO:Check shape of database object here and update it

    const workspace_team_mate = await this.workspace_invitation_model
      .findById(id)
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .populate({
        path: 'inviter',
        select:
          '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
      })
      .exec();
    if (workspace_team_mate) {
      return this.check_workspace_object_shape(workspace_team_mate);
    } else {
      return workspace_team_mate;
    }
  }
  async get_one(
    filter?: FilterQuery<WorkSpaceTeamMateInvitations>,
    projection: ProjectionType<WorkSpaceTeamMateInvitations> = {},
    options: QueryOptions<WorkSpaceTeamMateInvitations> = {},
  ): Promise<WorkSpaceTeamMateInvitations> {
    const workspace_team_mate = await this.workspace_invitation_model
      .findOne(filter, projection, options)
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .populate({
        path: 'inviter',
        select:
          '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
      })
      .exec();

    if (workspace_team_mate) {
      return this.check_workspace_object_shape(workspace_team_mate);
    } else {
      return workspace_team_mate;
    }
  }
  async update_one_by_id(
    id: string,
    update: UpdateQuery<WorkSpaceTeamMateInvitations>,
  ): Promise<WorkSpaceTeamMateInvitations> {
    return this.workspace_invitation_model
      .findByIdAndUpdate(id, update, {
        new: true,
      })
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .populate({
        path: 'inviter',
        select:
          '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
      })
      .exec();
  }
  async update_one(
    filter: FilterQuery<WorkSpaceTeamMateInvitations>,
    update: UpdateQuery<WorkSpaceTeamMateInvitations>,
  ) {
    return this.workspace_invitation_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .populate({
        path: 'inviter',
        select:
          '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
      })
      .exec();
  }
  async update_many(
    filter: FilterQuery<WorkSpaceTeamMateInvitations>,
    update: UpdateQuery<WorkSpaceTeamMateInvitations> = {},
    options: QueryOptions<WorkSpaceTeamMateInvitations> = {},
  ): Promise<UpdateWriteOpResult> {
    return this.workspace_invitation_model.updateMany(filter, update, options);
    // .exec();
  }

  async create(
    doc: AnyObject | AnyKeys<WorkSpaceTeamMateInvitations>,
  ): Promise<WorkSpaceTeamMateInvitations> {
    const invitation = await this.workspace_invitation_model.create(doc);
    return invitation.save();
  }
  // a function to help upgrade the data shape
  async check_workspace_object_shape(
    workspace_invitation: WorkSpaceTeamMateInvitations,
  ): Promise<WorkSpaceTeamMateInvitations> {
    return Promise.resolve(workspace_invitation);
  }
  delete_by_id(
    id?: string,
    options?: QueryOptions<WorkSpaceTeamMateInvitations>,
  ): Promise<any> {
    return this.workspace_invitation_model
      .findByIdAndDelete(id, options)
      .exec();
  }
  async delete_many(
    filter?: FilterQuery<WorkSpaceTeamMateInvitations>,
    options?: QueryOptions<WorkSpaceTeamMateInvitations>,
  ): Promise<any> {
    return this.workspace_invitation_model.deleteMany(filter, options).exec();
  }
  update_current(
    doc: WorkSpaceTeamMateInvitations,
  ): Promise<WorkSpaceTeamMateInvitations> {
    return doc.save();
  }
  check_exists(
    filter: FilterQuery<WorkSpaceTeamMateInvitations>,
  ): Promise<any> {
    return this.workspace_invitation_model.exists(filter).exec();
  }
}
