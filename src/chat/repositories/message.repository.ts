import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  AnyKeys,
  AnyObject,
  FilterQuery,
  Model,
  MongooseBulkWriteOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { Users } from 'src/auth/entities';
import { Messages } from '../entities/schema';
import { MESSAGE_TYPE } from '../entities/constants';

@Injectable()
export class MessagesRepository extends BaseRepository<Messages> {
  constructor(
    @InjectModel(Messages.name)
    private messages_model: Model<Messages>,
    @InjectModel(Users.name)
    private user_model: Model<Users>,
  ) {
    super();
  }

  get_all(
    filter: FilterQuery<Messages>,
    options?: QueryOptions<Messages>,
  ): Promise<Messages[]> {
    const baseFilter = { deletedAt: null };

    return this.messages_model
      .find({ ...baseFilter, ...filter }, {}, options)
      .populate({
        path: 'sender',
      })
      .populate({ path: 'conversation' })
      .exec();
  }
  async get_by_id(id: string): Promise<Messages> {
    //TODO:Check shape of database object here and update it

    return this.messages_model
      .findById(id)
      .populate({
        path: 'sender',
      })
      .populate({ path: 'conversation', populate: { path: 'assigned_to' } })
      .exec();
  }
  async get_one(
    filter: FilterQuery<Messages>,
    projection: ProjectionType<Messages> = {},
    options: QueryOptions<Messages> = {},
  ): Promise<Messages> {
    return await this.messages_model
      .findOne(filter, projection, options)
      .populate({
        path: 'sender',
      })
      .populate({ path: 'conversation' })
      .exec();
  }
  update_one_by_id(
    id: string,
    update: UpdateQuery<Messages>,
  ): Promise<Messages> {
    return this.messages_model
      .findByIdAndUpdate(id, update, {
        new: true,
      })
      .populate({
        path: 'sender',
      })
      .populate({ path: 'conversation' })
      .exec();
  }
  update_one(
    filter: FilterQuery<Messages>,
    update: UpdateQuery<Messages>,
  ): Promise<Messages> {
    return this.messages_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'sender',
      })
      .populate({ path: 'conversation' })
      .exec();
  }
  update_many(
    filter: FilterQuery<Messages>,
    update: UpdateQuery<Messages> = {},
  ): Promise<UpdateWriteOpResult> {
    return this.messages_model
      .updateMany(filter, update, { new: true })
      .populate({
        path: 'sender',
      })
      .populate({ path: 'conversation' })
      .exec();
  }

  async create(doc: AnyObject | AnyKeys<Messages>): Promise<Messages> {
    const message_model = await this.messages_model.create(doc);
    const result = await message_model.save();
    // .populate({
    //   path: 'sender',
    // })
    // awaitresult.populate({ path: 'conversation', populate: { path: 'assigned_to' } });
    console.log('result', result);
    return this.get_by_id(result._id);
  }
  // a function to help upgrade the data shape
  async check_conversation_object_shape(
    conversation: Messages,
  ): Promise<Messages> {
    return Promise.resolve(conversation);
  }
  delete_by_id(id?: string, options?: QueryOptions<Messages>): Promise<any> {
    return this.messages_model.findByIdAndDelete(id, options).exec();
  }
  delete_one(filter: FilterQuery<Messages>): Promise<any> {
    return this.messages_model.deleteOne(filter).exec();
  }
  logically_delete_by_id(id: string): Promise<Messages> {
    return this.messages_model
      .findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        {
          new: true,
        },
      )
      .exec();
  }
  delete_many(
    filter?: FilterQuery<Messages>,
    options?: QueryOptions<Messages>,
  ): Promise<any> {
    return this.messages_model.deleteMany(filter, options).exec();
  }
  update_current(doc: Messages): Promise<Messages> {
    return super.update_current(doc);
  }
  check_exists(filter: FilterQuery<Messages>): Promise<any> {
    return this.messages_model.exists(filter).exec();
  }
  get_count(filter: FilterQuery<Messages>): Promise<any> {
    const baseFilter = { deletedAt: null };

    return this.messages_model
      .countDocuments({ ...baseFilter, ...filter })
      .exec();
  }
  bulk_operation(writes: any[]) {
    return this.messages_model.bulkWrite(writes);
  }
  search_message(search_term: string) {
    return this.messages_model
      .find({
        $text: { $search: search_term },
      })
      .populate({
        path: 'sender',
      })
      .populate({
        path: 'conversation',
        populate: [
          {
            path: 'lead',
          },
          {
            path: 'last_message',
          },
        ],
      })
      .exec();
  }
}
