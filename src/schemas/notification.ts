import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type AppNotificationDocument = HydratedDocument<AppNotification>;

@Schema({ timestamps: true })
export class AppNotification {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user_id: mongoose.Schema.Types.ObjectId; //通知を受け取るユーザー

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  sender_id?: mongoose.Schema.Types.ObjectId; //通知を送信したユーザー

  @Prop({ required: true })
  type: string; //フォロー、いいね、コメントなど通知の種類を区別

  @Prop({ default: false })
  is_read: boolean; //通知を見たかどうか

  @Prop({ default: false })
  is_clicked: boolean; //タップしてアクションを実行したかどうか

  @Prop({ default: null })
  expires_at?: Date; //通知の有効期限

  @Prop({ default: 1 })
  priority: number; //優先順位（数が多い方が重要度が高い）

  @Prop({ default: null })
  action_url?: string;

  @Prop({ default: true })
  is_active: boolean; //非アクティブな場合は取り消し状態

  // タイムスタンプフィールドをTypeScriptに認識させるための定義
  createdAt?: Date;
  updatedAt?: Date;
}
export const AppNotificationSchema =
  SchemaFactory.createForClass(AppNotification);
