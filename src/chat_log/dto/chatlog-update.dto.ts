import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsDate,
  IsNumber,
} from 'class-validator';
import mongoose from 'mongoose';

export class ChatLogUpDateDto {
  @IsNotEmpty()
  initiator_user: string;

  @IsNotEmpty()
  target_user: string;

  @IsNotEmpty()
  status: 0 | 1 | 2 | 3 | 4;

  cancelled_user?: string;

  started_at?: Date;

  ended_at?: Date;
}
