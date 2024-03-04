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
import { List } from 'src/contacts/entities/list.entity';
import { USERTYPE, Users } from '../entities';
import { Counter } from '../entities/schema/counter.schema';

import { generate_verification_code } from 'src/app/utilities/email_verification_code';
import { escape_regex, translateOperatorIntoRegex } from '../utilities';

@Injectable()
export class UserRepository extends BaseRepository<Users> {
  delete_one(
    filter: FilterQuery<Users>,
    options?: QueryOptions<Users>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Users.name) private users_model: Model<Users>,
    @InjectModel(Counter.name) private counter_model: Model<Counter>,
    @InjectModel(List.name) private list_model: Model<List>,
  ) {
    super();
  }

  //getRecentContacts is a function that makes a query to the users collection and returns the 30 most recent contacts sorted by created_at property
  async get_recent_contacts(workspace: string): Promise<Users[]> {
    return await this.users_model
      .find({ workspace })
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();
  }

  async get_all(
    filter: FilterQuery<Users>,
    projection: ProjectionType<Users> = {},
    default_options: QueryOptions<Users> = {},
    populate?: string | string[],
    select?: any,
  ): Promise<Users[]> {
    let users: Users[] = [];
    const options = {
      sort: {
        createdAt: -1,
      },
    };
    if (populate) {
      return this.users_model
        .find(filter, projection, default_options)
        .populate(populate, select)
        .exec();
    } else {
      if (filter.search && filter.key && filter.operator && filter.value) {
        const escapedSearch = escape_regex(filter.search);
        const escapedFilterValue = escape_regex(filter.value);

        users = await this.users_model.find({
          workspace: filter.workspace,
          $or: [
            { user_name: { $regex: escapedSearch, $options: 'i' } },
            { email: { $regex: escapedSearch, $options: 'i' } },
            { phone_number: { $regex: escapedSearch, $options: 'i' } },
            { company_name: { $regex: escapedSearch, $options: 'i' } },
            { country: { $regex: escapedSearch, $options: 'i' } },
            { city: { $regex: escapedSearch, $options: 'i' } },
            {
              [filter.key]: {
                $regex: translateOperatorIntoRegex(
                  filter.operator,
                  escapedFilterValue,
                ),
                $options: 'i',
              },
            },
          ],
        });
      } else if (filter.key && filter.operator) {
        const escapedFilterValue = escape_regex(filter.value);
        users = await this.users_model
          .find(
            {
              workspace: filter.workspace,
              $and: [
                {
                  [filter.key]: !escapedFilterValue
                    ? null
                    : {
                        $regex: translateOperatorIntoRegex(
                          filter.operator,
                          escapedFilterValue,
                        ),
                        $options: 'i',
                      },
                },
              ],
            },
            projection,
            options,
          )
          .exec();
      } else if (filter.search) {
        const escapedSearch = escape_regex(filter.search);

        users = await this.users_model.find({
          workspace: filter.workspace,
          $or: [
            { user_name: { $regex: escapedSearch, $options: 'i' } },
            { email: { $regex: escapedSearch, $options: 'i' } },
            { phone_number: { $regex: escapedSearch, $options: 'i' } },
            { company_name: { $regex: escapedSearch, $options: 'i' } },
            { country: { $regex: escapedSearch, $options: 'i' } },
            { city: { $regex: escapedSearch, $options: 'i' } },
          ],
        });
      } else if (filter.list) {
        const list = await this.list_model.findById(filter.list);

        return await this.users_model.find({
          _id: { $in: list.contact_ids },
        });
      } else {
        users = await this.users_model.find(
          {
            workspace: filter.workspace,
          },
          projection,
          options,
        );
      }

      const final_users = users.map((current_user) => {
        return this.check_user_object_shape(current_user);
      });
      return Promise.all(final_users);
    }
  }
  async get_by_id(
    id: string,
    populate?: string | string[],
    select?: any,
  ): Promise<Users> {
    //TODO:Check shape of database object here and update it
    if (populate) {
      const user = await this.users_model
        .findById(id)
        .populate(populate, select)
        .exec();
      return this.check_user_object_shape(user);
    } else {
      const user = await this.users_model.findById(id);

      if (user) {
        return this.check_user_object_shape(user, populate);
      } else {
        return user;
      }
    }
  }
  async get_one(
    filter?: FilterQuery<Users>,
    projection: ProjectionType<Users> = {},
    populate?: string | string[],
    select?: any,
    options: QueryOptions<Users> = {},
  ): Promise<Users> {
    if (populate) {
      const user = await this.users_model
        .findOne(filter, projection, options)
        .populate(populate, select)
        .exec();
      return this.check_user_object_shape(user);
    } else {
      const user = await this.users_model.findOne(filter, projection, options);

      if (user) {
        return this.check_user_object_shape(user, populate);
      } else {
        return user;
      }
    }
  }
  update_one_by_id(id: string, update: UpdateQuery<Users>): Promise<Users> {
    return this.users_model
      .findByIdAndUpdate(id, update, { new: true })
      .populate('owner')
      .exec();
  }
  update_one(
    filter: FilterQuery<Users>,
    update: UpdateQuery<Users>,
  ): Promise<Users> {
    return this.users_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate('owner')
      .exec();
  }

  update_many(
    filter: FilterQuery<Users>,
    update: UpdateQuery<Users> = {},
    options: QueryOptions<Users> = {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<UpdateWriteOpResult> {
    return this.users_model.updateMany(filter, update, options).exec();
  }

  async create(doc: AnyObject | AnyKeys<Users>): Promise<Users> {
    const user = await this.users_model.create({
      ...doc,
      verification_code: generate_verification_code(8),
    });
    const counter_collection = await this.counter_model.findOneAndUpdate(
      {
        collection_name: Users.name.toLocaleLowerCase(),
      },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true },
    );

    if (
      user.user_name === 'annonymous' ||
      user.user_name === 'Anonymous' ||
      user.user_name === 'Annonymous'
    ) {
      user.set('user_name', `Anonymous${counter_collection.sequence_value}`, {
        strict: false,
      });
    }
    user.user_number = counter_collection.sequence_value;
    return user.save();
  }
  // a function to help upgrade the data shape
  async check_user_object_shape(
    user: Users,
    populate?: string | string[],
  ): Promise<Users> {
    if (user.type === USERTYPE.AGENT && user.user_name.includes('Sparky')) {
      user.set('type', USERTYPE.BOT, {
        strict: false,
      });

      await user.save();
    }
    return Promise.resolve(user);
  }
  async create_many(docs: AnyObject[], workspace_id: string): Promise<any> {
    const userBulk: any = docs.map((user) => {
      return {
        updateOne: {
          filter: { phone_number: user.phone_number, email: user.email },
          update: {
            $set: {
              ...user,
              workspace: new mongoose.Types.ObjectId(workspace_id),
            },
          },
          upsert: true,
        },
      };
    });

    return await this.users_model.bulkWrite(userBulk, {
      ordered: false,
    });
  }
  delete_by_id(id?: string, options?: QueryOptions<Users>): Promise<any> {
    return this.users_model.findByIdAndDelete(id, options).exec();
  }
  delete_many(
    filter?: FilterQuery<Users>,
    options?: QueryOptions<Users>,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<any> {
    return this.users_model.deleteMany(filter, options).exec();
  }
  update_current(doc: Users): Promise<Users> {
    return doc.save();
  }
  check_exists(filter: FilterQuery<Users>): Promise<any> {
    return this.users_model.exists(filter).exec();
  }
}
