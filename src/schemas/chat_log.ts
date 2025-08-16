import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type ChatLogDocument = HydratedDocument<ChatLog>;

@Schema({ timestamps: true })
export class ChatLog {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  initiator_user: mongoose.Types.ObjectId; // 発信者

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  target_user: mongoose.Types.ObjectId; // 着信者

  // 通話ステータス
  // 0:通話が正常に終了した 1:相手が応答せず時間切れ 2:発信者がコールを取り消した 3:受信者が明示的に拒否 4:接続そのものに失敗
  @Prop({ required: true })
  status: 0 | 1 | 2 | 3 | 4;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  cancelled_user?: mongoose.Types.ObjectId; // キャンセルした人（必要なら）

  @Prop({ default: null }) // トーク時間（接続時）
  chat_duration?: number;
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
