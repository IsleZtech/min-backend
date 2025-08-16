import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type ReportDocument = HydratedDocument<Report>;

@Schema({ timestamps: true })
export class Report {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  initiator_user: mongoose.Schema.Types.ObjectId; // 通報した人のオブジェクトID

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  target_user: mongoose.Schema.Types.ObjectId; // 通報された人のオブジェクトID

  @Prop({ required: true })
  reason_code: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: null })
  message: Record<string, any>[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);
