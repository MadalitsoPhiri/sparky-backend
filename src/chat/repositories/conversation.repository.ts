import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
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
import { Users } from 'src/auth/entities';
import { ConversationsCacheRepository } from 'src/redis/repositories/conversation_cache.repository';
import { SortDto } from '../entities/dtos/sort.dto';
import { Conversations } from '../entities/schema';

@Injectable()
export class ConversationsRepository extends BaseRepository<Conversations> {
  constructor(
    @InjectModel(Conversations.name)
    private conversations_model: Model<Conversations>,
    @InjectModel(Users.name)
    private user_model: Model<Users>,
    private conversation_cache: ConversationsCacheRepository,
  ) {
    super();
  }

  get_all(
    filter: FilterQuery<Conversations>,
    options?: QueryOptions<Conversations>,
    sort: SortDto = { updatedAt: -1 },
  ): Promise<Conversations[]> {
    return this.conversations_model
      .find(filter, {}, options)
      .sort({ ...sort })
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'last_message',
        populate: {
          path: 'sender',
        },
      })
      .populate('created_by', '', this.user_model)
      .populate('assigned_to', '', this.user_model)
      .populate('participants', '', this.user_model)
      .populate('lead', '', this.user_model)
      .exec();
  }

  async get_by_id(id: string): Promise<Conversations> {
    //TODO:Check shape of database object here and update it

    return this.conversations_model
      .findById(id)
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'last_message',
        populate: {
          path: 'sender',
        },
      })
      .populate('created_by', '', this.user_model)
      .populate('assigned_to', '', this.user_model)
      .populate('participants', '', this.user_model)
      .populate('lead', '', this.user_model)
      .exec();
  }

  async get_one(
    filter: FilterQuery<Conversations>,
    projection: ProjectionType<Conversations> = {},
    options: QueryOptions<Conversations> = {},
  ): Promise<Conversations> {
    return await this.conversations_model
      .findOne(filter, projection, options)
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'last_message',
        populate: {
          path: 'sender',
        },
      })
      .populate('created_by', '', this.user_model)
      .populate('assigned_to', '', this.user_model)
      .populate('participants', '', this.user_model)
      .populate('lead', '', this.user_model)
      .exec();
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<Conversations>,
  ): Promise<Conversations> {
    const conversation = await this.conversations_model
      .findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, update, {
        new: true,
      })
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'last_message',
        populate: {
          path: 'sender',
        },
      })
      .populate('created_by', '', this.user_model)
      .populate('assigned_to', '', this.user_model)
      .populate('participants', '', this.user_model)
      .populate('lead', '', this.user_model)
      .exec();
    return Promise.resolve(conversation);
  }

  async update_one(
    filter: FilterQuery<Conversations>,
    update: UpdateQuery<Conversations>,
  ): Promise<Conversations> {
    const conversation = await this.conversations_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'last_message',
        populate: {
          path: 'sender',
        },
      })
      .populate('created_by', '', this.user_model)
      .populate('assigned_to', '', this.user_model)
      .populate('participants', '', this.user_model)
      .populate('lead', '', this.user_model)
      .exec();

    await this.conversation_cache.cache_conversation(
      conversation.id,
      conversation,
    );
    return Promise.resolve(conversation);
  }

  update_many(
    filter: FilterQuery<Conversations>,
    update: UpdateQuery<Conversations> = {},
  ): Promise<UpdateWriteOpResult> {
    return this.conversations_model
      .updateMany(filter, update, { new: true })
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'last_message',
        populate: {
          path: 'sender',
        },
      })
      .populate('created_by', '', this.user_model)
      .populate('assigned_to', '', this.user_model)
      .populate('participants', '', this.user_model)
      .populate('lead', '', this.user_model)
      .exec();
  }

  async create(
    doc: AnyObject | AnyKeys<Conversations>,
  ): Promise<Conversations> {
    const result = await (await this.conversations_model.create(doc)).save();
    await this.conversation_cache.cache_conversation(result.id, result);
    return Promise.resolve(result);
  }

  delete_by_id(
    id?: string,
    options?: QueryOptions<Conversations>,
  ): Promise<any> {
    return this.conversations_model.findByIdAndDelete(id, options).exec();
  }

  async delete_one(
    filter: FilterQuery<Conversations>,
    options?: QueryOptions<Conversations>,
  ): Promise<any> {
    return await this.conversations_model.deleteOne(filter, options).exec();
  }

  delete_many(
    filter?: FilterQuery<Conversations>,
    options?: QueryOptions<Conversations>,
  ): Promise<any> {
    return this.conversations_model.deleteMany(filter, options).exec();
  }

  update_current(doc: Conversations): Promise<Conversations> {
    return doc.save();
  }

  check_exists(filter: FilterQuery<Conversations>): Promise<any> {
    return this.conversations_model.exists(filter).exec();
  }
  get_count(filter: FilterQuery<Conversations>): Promise<any> {
    return this.conversations_model.countDocuments(filter).exec();
  }

  // a function to help upgrade the data shape
  async check_conversation_object_shape(
    conversation: Conversations,
  ): Promise<Conversations> {
    return Promise.resolve(conversation);
  }
}
