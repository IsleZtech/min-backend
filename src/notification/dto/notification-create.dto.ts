import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsDate,
  IsNumber,
} from 'class-validator';
import mongoose from 'mongoose';

export class AppNotificationCreateDto {
  @IsNotEmpty()
  user_id: String;

  sender_id: String;

  @IsNotEmpty()
  type: string;

  post_id?: String;

  @IsBoolean()
  is_read?: boolean = false;

  @IsBoolean()
  is_clicked?: boolean = false;

  @IsDate()
  expires_at?: Date;

  @IsNumber()
  priority?: number = 1;

  @IsString()
  action_url?: string;
}
