import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateResult } from 'mongodb';
import {
  AnyKeys,
  AnyObject,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { Notes } from '../entities/schema';

@Injectable()
export class NotesRepository extends BaseRepository<Notes> {
  constructor(@InjectModel(Notes.name) private notes_model: Model<Notes>) {
    super();
  }
  get_all(
    filter: FilterQuery<Notes>,
    sort?: Notes | unknown,
  ): Promise<Notes[]> {
    if (sort) {
      return this.notes_model
        .find(filter, null, { sort: sort })
        .populate({
          path: 'created_by',
          select: 'user_name',
        })
        .populate({ path: 'lead', select: 'user_name' })
        .exec();
    }
    return this.notes_model
      .find(filter)
      .populate({
        path: 'created_by',
      })
      .populate({ path: 'lead' })
      .exec();
  }
  get_by_id(id: any): Promise<Notes> {
    return this.notes_model
      .findById(id)
      .populate({
        path: 'created_by',
      })
      .populate({ path: 'lead' })
      .exec();
  }

  get_one(
    filter?: FilterQuery<Notes>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<Notes>,
    options?: QueryOptions<Notes>,
  ): Promise<Notes> {
    return this.notes_model
      .findOne(filter, projection, options)
      .populate({
        path: 'created_by',
      })
      .populate({ path: 'lead' })
      .exec();
  }
  update_many(
    filter?: FilterQuery<Notes>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<Notes>,
  ): Promise<UpdateResult> {
    return this.notes_model
      .updateMany(filter, update, { new: true })
      .populate({
        path: 'created_by',
      })
      .populate({ path: 'lead' })
      .exec();
  }
  update_one(
    filter: FilterQuery<Notes>,
    update: UpdateQuery<Notes>,
  ): Promise<Notes> {
    return this.notes_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'created_by',
      })
      .populate({ path: 'lead' })
      .exec();
  }
  update_one_by_id(id: string, update: UpdateQuery<Notes>): Promise<Notes> {
    return this.notes_model
      .findByIdAndUpdate(id, update, {
        new: true,
      })
      .populate({
        path: 'created_by',
      })
      .populate({ path: 'lead' })
      .exec();
  }
  delete_by_id(id?: string, options?: QueryOptions<Notes>): Promise<any> {
    return this.notes_model.findByIdAndDelete(id, options).exec();
  }
  delete_one(filter: FilterQuery<Notes>): Promise<any> {
    return this.notes_model.deleteOne(filter).exec();
  }
  delete_many(filter: FilterQuery<Notes>): Promise<any> {
    return this.notes_model.deleteMany(filter).exec();
  }
  async create(doc: AnyObject | AnyKeys<Notes>): Promise<Notes> {
    const notes_model = await this.notes_model.create(doc);
    await notes_model.save();
    return this.get_by_id(notes_model.id);
  }
  check_exists(filter: FilterQuery<Notes>): Promise<any> {
    return this.notes_model.exists(filter).exec();
  }
  update_current(doc: Notes): Promise<Notes> {
    return super.update_current(doc);
  }
}
