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
import { WidgetConfig, WorkSpaces } from '../entities';

@Injectable()
export class WidgetConfigRepository extends BaseRepository<WidgetConfig> {
  async delete_one(
    filter: mongoose.FilterQuery<WidgetConfig>,
    options?: mongoose.QueryOptions<WidgetConfig>,
  ): Promise<any> {
    return this.widget_config_model.deleteOne(filter);
  }
  constructor(
    @InjectModel(WidgetConfig.name)
    private widget_config_model: Model<WidgetConfig>,
    @InjectModel(WorkSpaces.name)
    private workspaces_model: Model<WorkSpaces>,
  ) {
    super();
  }

  get_all(
    filter: FilterQuery<WidgetConfig>,
    projection: ProjectionType<WidgetConfig> = {},
  ): Promise<WidgetConfig[]> {
    return this.widget_config_model
      .find(filter, projection)
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();
  }
  async get_by_id(id: string): Promise<WidgetConfig> {
    //TODO:Check shape of database object here and update it

    const widget_config = await this.widget_config_model
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
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();

    return this.check_widget_config_object_shape(widget_config);
  }
  async get_one(
    filter: FilterQuery<WidgetConfig>,
    projection: ProjectionType<WidgetConfig> = {},
    options: QueryOptions<WidgetConfig> = {},
  ): Promise<WidgetConfig> {
    const widget_config = await this.widget_config_model
      .findOne(filter, projection, options)
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();
    return this.check_widget_config_object_shape(widget_config);
  }
  async update_one_by_id(
    id: string,
    update: mongoose.UpdateQuery<WidgetConfig>,
  ): Promise<WidgetConfig> {
    const updated_doc = await this.widget_config_model
      .findByIdAndUpdate(id, update, { new: true })
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();

    return this.check_widget_config_object_shape(updated_doc);
  }
  async update_one(
    filter: FilterQuery<WidgetConfig>,
    update: UpdateQuery<WidgetConfig>,
  ): Promise<WidgetConfig> {
    const updated_doc = await this.widget_config_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();

    return this.check_widget_config_object_shape(updated_doc);
  }

  update_many(
    filter: FilterQuery<WidgetConfig>,
    update: UpdateQuery<WidgetConfig> = {},
    options: QueryOptions<WidgetConfig> = {},
  ): Promise<UpdateWriteOpResult> {
    return this.widget_config_model.updateMany(filter, update, options).exec();
  }

  async create(doc: AnyObject | AnyKeys<WidgetConfig>): Promise<WidgetConfig> {
    const widget_config = await this.widget_config_model.create(doc);
    return widget_config.save();
  }

  // a function to help upgrade the data shape
  async check_widget_config_object_shape(
    widget_config: WidgetConfig,
  ): Promise<WidgetConfig> {
    if (widget_config) {
      if (widget_config?.toObject()?.hasOwnProperty('host_domain')) {
        widget_config.set('host_domain', undefined, { strict: false });
        widget_config.set('allowed_origins', [], { strict: false });
      }
      if (
        widget_config.greetings.header.description ==
        'Sparky helps you make personalized cannabis recommendations.'
      ) {
        widget_config.set(
          'greetings.header.description',
          'Ask us anything, or share your feedback.',
          { strict: false },
        );
      }

      if (!widget_config?.toObject()?.hasOwnProperty('chat_suggestions')) {
        widget_config.set('chat_suggestions.suggestion1', 'Just browsing!', {
          strict: false,
        });

        widget_config.set(
          'chat_suggestions.suggestion2',
          " I'm new and want to start an application.",
          { strict: false },
        );

        widget_config.set(
          'chat_suggestions.suggestion3',
          'Help me with my existing application',
          { strict: false },
        );
      }
      const final_widget_config = await widget_config.save();
      return Promise.resolve(final_widget_config);
    }
    return Promise.resolve(widget_config);
  }
  delete_by_id(
    id?: string,
    options?: QueryOptions<WidgetConfig>,
  ): Promise<any> {
    return this.widget_config_model.findByIdAndDelete(id, options).exec();
  }
  delete_many(
    filter?: FilterQuery<WidgetConfig>,
    options?: QueryOptions<WidgetConfig>,
  ): Promise<any> {
    return this.widget_config_model.deleteMany(filter, options).exec();
  }
  update_current(doc: WidgetConfig): Promise<WidgetConfig> {
    return doc.save();
  }
  check_exists(filter: FilterQuery<WidgetConfig>): Promise<any> {
    return this.widget_config_model.exists(filter).exec();
  }
}
