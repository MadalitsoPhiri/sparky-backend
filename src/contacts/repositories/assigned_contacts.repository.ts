import {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose';
import { AssignedContacts } from '../entities/assigned_contacts.schema';
import { CreateAssignedContactsDto } from '../dto/create-assigned-contacts.dto';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { UpdateResult } from 'mongodb';

@Injectable()
export class AssignedContactsRepository extends BaseRepository<AssignedContacts> {
  constructor(
    @InjectModel(AssignedContacts.name)
    private assignedContactsModel: Model<AssignedContacts>,
  ) {
    super();
  }

  async get_by_id(id: any): Promise<AssignedContacts> {
    const assignedContactsRecord = await this.assignedContactsModel.findById(
      id,
    );
    return assignedContactsRecord;
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<AssignedContacts>,
  ): Promise<AssignedContacts> {
    const assignedContactsRecord =
      await this.assignedContactsModel.findByIdAndUpdate(id, update, {
        new: true,
      });
    return assignedContactsRecord;
  }

  async delete_by_id(id?: string): Promise<any> {
    const assignedContactsRecord =
      await this.assignedContactsModel.findByIdAndDelete(id);
    return assignedContactsRecord;
  }

  get_one(
    filter?: FilterQuery<AssignedContacts>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<AssignedContacts>,
    options?: QueryOptions<AssignedContacts>,
  ): Promise<AssignedContacts> {
    throw new Error('Method not implemented.');
  }
  async get_all(
    filter: FilterQuery<AssignedContacts>,
    projection?: ProjectionType<AssignedContacts>,
  ): Promise<AssignedContacts[]> {
    return await this.assignedContactsModel.find(filter, projection);
  }

  update_many(
    filter?: FilterQuery<AssignedContacts>,
    update?: UpdateQuery<AssignedContacts> | UpdateWithAggregationPipeline,
    options?: QueryOptions<AssignedContacts>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<AssignedContacts>,
    update: UpdateQuery<AssignedContacts>,
  ): Promise<AssignedContacts> {
    return this.assignedContactsModel.findOneAndUpdate(filter, update).exec();
  }

  delete_one(
    filter: FilterQuery<AssignedContacts>,
    options?: QueryOptions<AssignedContacts>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  delete_many(filter: FilterQuery<AssignedContacts>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<AssignedContacts>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async create(
    createAssignedContactsDto: CreateAssignedContactsDto,
  ): Promise<AssignedContacts> {
    const createdAssignedContacts = new this.assignedContactsModel(
      createAssignedContactsDto,
    );
    return createdAssignedContacts.save();
  }

  async findByEmail(email: string): Promise<AssignedContacts[] | null> {
    return this.assignedContactsModel.find({ email }).exec();
  }

  async findAll(): Promise<AssignedContacts[]> {
    return this.assignedContactsModel.find().exec();
  }

  async deleteByEmail(email: string): Promise<AssignedContacts | null> {
    return this.assignedContactsModel.findOneAndDelete({ email }).exec();
  }
}

export const usersSchema = SchemaFactory.createForClass(
  AssignedContactsRepository,
);
