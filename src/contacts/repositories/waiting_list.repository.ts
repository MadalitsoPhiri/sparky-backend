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
import { WaitingList } from '../entities/waiting_list.schema';
import { CreateWaitingListDto } from '../dto/create-waiting-list.dto';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { UpdateResult } from 'mongodb';

@Injectable()
export class WaitingListRepository extends BaseRepository<WaitingList> {
  constructor(
    @InjectModel(WaitingList.name) private waitingListModel: Model<WaitingList>,
  ) {
    super();
  }

  async get_by_id(id: any): Promise<WaitingList> {
    const waitingListRecord = await this.waitingListModel.findById(id);
    return waitingListRecord;
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<WaitingList>,
  ): Promise<WaitingList> {
    const waitingListRecord = await this.waitingListModel.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
      },
    );
    return waitingListRecord;
  }

  async delete_by_id(id?: string): Promise<any> {
    const waitingListRecord = await this.waitingListModel.findByIdAndDelete(id);
    return waitingListRecord;
  }

  get_one(
    filter?: FilterQuery<WaitingList>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<WaitingList>,
    options?: QueryOptions<WaitingList>,
  ): Promise<WaitingList> {
    throw new Error('Method not implemented.');
  }
  async get_all(
    filter: FilterQuery<WaitingList>,
    projection?: ProjectionType<WaitingList>,
  ): Promise<WaitingList[]> {
    return await this.waitingListModel.find(filter, projection);
  }

  update_many(
    filter?: FilterQuery<WaitingList>,
    update?: UpdateQuery<WaitingList> | UpdateWithAggregationPipeline,
    options?: QueryOptions<WaitingList>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<WaitingList>,
    update: UpdateQuery<WaitingList>,
  ): Promise<WaitingList> {
    throw new Error('Method not implemented.');
  }

  delete_one(
    filter: FilterQuery<WaitingList>,
    options?: QueryOptions<WaitingList>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  delete_many(filter: FilterQuery<WaitingList>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<WaitingList>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async create(
    createWaitingListDto: CreateWaitingListDto,
  ): Promise<WaitingList> {
    const createdWaitingList = new this.waitingListModel(createWaitingListDto);
    return createdWaitingList.save();
  }

  async findByEmail(email: string): Promise<WaitingList | null> {
    return this.waitingListModel.findOne({ email }).exec();
  }

  async findAll(): Promise<WaitingList[]> {
    return this.waitingListModel.find().exec();
  }

  async deleteByEmail(email: string): Promise<WaitingList | null> {
    return this.waitingListModel.findOneAndDelete({ email }).exec();
  }
}

export const usersSchema = SchemaFactory.createForClass(WaitingListRepository);
