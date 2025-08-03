import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type DeleteDocument = HydratedDocument<Delete>;

@Schema({ timestamps: true })
export class Delete {
  @Prop({ default: null })
  reason_code?: number; //0:バグが多い,1: SUPにあまり友達がいない,2: SUPをあまり使わない,3: SUPの使い方がよくわからない,4: その他,

  @Prop({ default: null })
  reason?: string;

  @Prop({ default: null })
  language: string;

  @Prop({ default: null })
  birthday: string;

  @Prop({ default: null })
  name: string;
}

export const DeleteSchema = SchemaFactory.createForClass(Delete);
