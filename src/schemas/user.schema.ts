import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<User>;

export class Point {
  @Prop({ type: String, enum: ['Point'], required: true })
  type: 'Point';

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: function (coordinates: number[]) {
        return (
          coordinates.length === 2 &&
          coordinates[0] >= -180 &&
          coordinates[0] <= 180 && // 経度
          coordinates[1] >= -90 &&
          coordinates[1] <= 90
        ); // 緯度
      },
      message:
        '座標は [経度, 緯度] の形式で、経度は-180〜180、緯度は-90〜90の範囲である必要があります',
    },
  })
  coordinates: [number, number]; // [経度, 緯度]
}

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

  @Prop({ default: 0 })
  public gender: number; //性別　0:設定しない　1男　2女

  @Prop({
    type: Point,
    index: '2dsphere', // 地理空間インデックスを自動作成
  })
  public location: Point;

  @Prop({ required: true }) //ユーザ画像
  public profile_images: string[];

  @Prop({ default: null }) //アカウントの一言コメント。
  public bio: string;

  @Prop({ default: null }) //Instagram ID
  public instagram_id: string;

  @Prop({ default: null }) //beReal ID
  public beReal_id: string;

  @Prop({ default: null }) //tiktokId ID
  public tiktok_id: string;

  @Prop({ default: null }) //身長
  public height: number;

  @Prop({ default: null }) //mbti 0:設定しない 1:ENFJ 2:ENFP 3:ENTJ 4:ENTP 5:ESFJ 6:ESFP 7:ESTJ 8:ESTP 9:INFJ 10:INFP 11:INTJ 12:INTP 13:ISFJ 14:ISFP 15:ISTJ 16:ISTP
  public mbti: number;

  @Prop({ default: null }) // 休日 0:設定しない 1:土日　2:平日 3:不定期 4:その他
  public dayOff: number;

  @Prop({ default: null }) // 運動 0:設定しない 1:よくする 2:ときどきする 3:あまりしない 4:全くしない
  public exercise: number;

  @Prop({ default: null }) // お酒  0:設定しない 1:お酒 0:よく飲む 1:時々飲む 2:あまり飲まない 3:全く飲まない
  public alcohol: number;

  @Prop({ default: null }) // タバコ 0:設定しない 1:吸う　2:吸う（電子タバコ）　3:ときどき吸う　4:相手が嫌なら吸わない　5:吸わない
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
