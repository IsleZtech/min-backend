import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ ref: User.name, required: true }) //投稿ユーザーID
  public posted_by_user: mongoose.Schema.Types.ObjectId;

  @Prop({ ref: User.name, required: true }) //投稿されたユーザーID
  public posted_for_user: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true }) //投稿のメディアURL。
  public media_url: string;

  @Prop({ required: true, enum: [0, 1] }) //投稿のメディアURL。
  public media_type: number;

  @Prop({ required: true }) //投稿のメディアURL。
  public thumbnail_url: string;

  @Prop({ required: true, enum: [0, 1, 2, 3], default: 1 }) //プライバシーレベル（0：全ての人、1：相互、2：限定友達,3自分と投稿者のみ）。
  public privacy_level: number;

  @Prop({ default: true }) //エフェクトを外すかどうか。
  public is_effect: boolean;

  @Prop([{ ref: User.name, type: mongoose.Schema.Types.ObjectId }]) //閲覧リスト
  public view_list?: mongoose.Schema.Types.ObjectId[];

  @Prop([{ ref: User.name, type: mongoose.Schema.Types.ObjectId }]) //いいねリスト
  public like_list?: mongoose.Schema.Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
