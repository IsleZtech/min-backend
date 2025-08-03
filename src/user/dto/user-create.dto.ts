import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import mongoose from 'mongoose';

export class UserCreateDto {
  uid: string;

  fcm_token: string;

  language: string;

  @IsNotEmpty()
  phone_number: {
    country_code: number;
    number: number;
  };
  // @Matches(/^\d{4}-\d{2}-\d{2}$/, {
  //   message: '誕生日は YYYY-MM-DD 形式である必要があります',
  // })
  // @IsOptional()
  // birthday: string; //誕生日 2000-01-01
  // is_deleted: boolean; //退会したかどうか
  // login_date: Date; //ログイン日時
}
