import { IsOptional, Matches } from 'class-validator';

export class UserUpdateDto {
  user_name: string; //ユーザ名

  profile_image: string; //ユーザ画像

  bio: string; //ユーザの一言

  birthday: string; //誕生日 2000-01-01

  is_top_supporterst: boolean; //トップサポーターの公開設定

  is_public_account: boolean; //アカウントの公開設定

  is_phone_number_searchable: boolean; //電話番号で検索可能かどうか

  fcm_token: String;

  language: String;
}
