import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type MatchDocument = HydratedDocument<Match>;

@Schema({ timestamps: true })
export class Match {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  initiator_user: mongoose.Schema.Types.ObjectId; // ブロックした人のオブジェクトID

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  target_user: mongoose.Schema.Types.ObjectId; // ブロックされた人のオブジェクトID

  @Prop({ required: true }) // 0:Nope 1:Never 2:Like
  public action: number;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
