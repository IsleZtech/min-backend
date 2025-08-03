import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true }) //ファイヤーベスで作成したUID
  public uid: string;

  @Prop({ required: true, unique: false }) //通知ようのトークン
  public fcm_token: string;

  @Prop({ required: true, unique: true })
  public pin_code: string;

  @Prop({ required: true })
  public language: string; //言語

  @Prop({ default: null }) //ユーザ名
  public user_name: string;

  @Prop({
    default:
      'https://firebasestorage.googleapis.com/v0/b/sup-dev-edc86.firebasestorage.app/o/notImage.png?alt=media&token=b322e5ad-ed8a-440e-8d59-2c0dd69b1cde',
  }) //ユーザ画像
  public profile_image: string;

  @Prop({ default: null }) //アカウントの一言コメント。
  public bio: string;

  @Prop({
    //電話番号
    type: {
      country_code: { type: String },
      number: { type: String },
    },
  })
  phone_number: {
    country_code: String;
    number: String;
  };

  @Prop({ default: null }) //誕生日 2000-01-01
  public birthday: string;

  @Prop({ default: null }) //Instagram ID
  public instagra_id: string;

  @Prop({ default: true }) //アカウントの公開設定
  public is_public_account: boolean;

  @Prop({ default: true }) //トップサポーターの公開設定
  public is_top_supporterst: boolean;

  @Prop({ default: true }) //電話番号で検索可能かどうか
  public is_phone_number_searchable: boolean;

  @Prop([{ ref: User.name, type: mongoose.Schema.Types.ObjectId }]) //閲覧リスト
  public blocked_by_users: mongoose.Schema.Types.ObjectId[];

  @Prop([{ ref: User.name, type: mongoose.Schema.Types.ObjectId }]) //閲覧リスト
  public restricted_users: mongoose.Schema.Types.ObjectId[];

  @Prop([{ ref: User.name, type: mongoose.Schema.Types.ObjectId }]) //親しい友達
  public best_friends: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: false }) //退会したかどうか
  public is_deleted: boolean;

  @Prop({ default: new Date() }) //ログイン日時
  public login_date: Date;

  @Prop({ default: false }) //ログインしたかどうか
  public is_login: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
