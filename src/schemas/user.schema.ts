import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true }) //ファイヤーベスで作成したUID
  public uid: string;

  @Prop({ required: true, unique: false }) //通知ようのトークン
  public fcm_token: string;

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

  @Prop({ default: null }) //ユーザ名
  public user_name: string;

  @Prop({ default: null }) //誕生日 2000-01-01
  public birthday: string;

  @Prop({ required: true })
  public language: string; //言語

  @Prop({ required: true })
  public country: string; //国

  @Prop({ required: true })
  public prefecture: string; //都市

  @Prop({ required: true })
  public geohash: string; //位置情報

  @Prop({ required: true }) //ユーザ画像
  public profile_images: string[];

  @Prop({ default: null }) //アカウントの一言コメント。
  public bio: string;

  @Prop({ default: null }) //Instagram ID
  public instagra_id: string;

  @Prop({ default: null }) //beReal ID
  public beReal_id: string;

  @Prop({ default: null }) //tiktokId ID
  public tiktok_id: string;

  @Prop({ default: null }) //身長
  public height: number;

  @Prop({ default: null }) //mbti 0:ENFJ 1:ENFP 2:ENTJ 3:ENTP 4:ESFJ 5:ESFP 6:ESTJ 7:ESTP 8:INFJ 9:INFP 10:INTJ 11:INTP 12:ISFJ 13:ISFP 14:ISTJ 15:ISTP
  public mbti: number;

  @Prop({ default: null }) //休日 0:土日　1:平日 2:不定期 3:その他
  public dayOff: number;

  @Prop({ default: null }) //運動 0:よくする 1:ときどきする 2:あまりしない 3:全くしない
  public external: number;

  @Prop({ default: null }) //お酒 0:よく飲む 1:時々飲む 2:あまり飲まない 3:全く飲まない
  public alcohol: number;

  @Prop({ default: null }) //タバコ 0:吸う　1:吸う（電子タバコ）　2:ときどき吸う　3:相手が嫌なら吸わない　4:吸わない
  public smoking: number;

  @Prop([{ ref: User.name, type: mongoose.Schema.Types.ObjectId }]) //身近な友達の電話番号、表示させないため
  public close_friends: string[];

  @Prop({ default: false }) //退会したかどうか
  public is_deleted: boolean;

  @Prop({ default: new Date() }) //ログイン日時
  public login_date: Date;

  @Prop({ default: false }) //ログインしたかどうか
  public is_login: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
