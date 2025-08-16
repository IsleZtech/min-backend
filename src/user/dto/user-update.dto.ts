import { IsOptional, Matches } from 'class-validator';

export class UserUpdateDto {
  fcm_token?: string;

  user_name?: string; //ユーザ名

  birthday?: string;

  profile_images?: string[]; //ユーザ画像

  language?: String;

  gender?: number;

  bio?: string; //ユーザの一言

  country?: string;

  prefecture?: string;

  location?: string;

  instagram_id?: string;

  beReal_id?: string;

  tiktok_id?: string;

  height?: string;

  mbti?: string;

  dayOff?: string;

  exercise?: string;

  alcohol?: string;

  smoking?: string;
}
