import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type MuteDocument = HydratedDocument<Mute>;

@Schema({ timestamps: true })
export class Mute {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  initiator: mongoose.Schema.Types.ObjectId; // 非表示にした人のオブジェクトID

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  target: mongoose.Schema.Types.ObjectId; // 非表示にされた人のオブジェクトID
}

export const MuteSchema = SchemaFactory.createForClass(Mute);
