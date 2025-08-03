import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type BlockDocument = HydratedDocument<Block>;

@Schema({ timestamps: true })
export class Block {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  initiator: mongoose.Schema.Types.ObjectId; // ブロックした人のオブジェクトID

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  target: mongoose.Schema.Types.ObjectId; // ブロックされた人のオブジェクトID
}

export const BlockSchema = SchemaFactory.createForClass(Block);
