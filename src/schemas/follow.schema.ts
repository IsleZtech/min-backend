import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type FollowDocument = HydratedDocument<Follow>;

@Schema({ timestamps: true })
export class Follow {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  public initiator: mongoose.Schema.Types.ObjectId; //フォローした人のオブジェクトID

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  public target: mongoose.Schema.Types.ObjectId; //フォローされた人のオブジェクトID
}
export const FollowSchema = SchemaFactory.createForClass(Follow);
