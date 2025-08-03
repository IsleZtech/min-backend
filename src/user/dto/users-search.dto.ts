import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PhoneNumberDto {
  @Type(() => Number)
  country_code: number;

  @Type(() => Number)
  number: number;
}

export class SearchUserDto {
  @IsOptional()
  @IsString()
  user_id?: string; // ユーザーIDをオプションで受け取る

  @IsOptional()
  @ValidateNested()
  @Type(() => PhoneNumberDto)
  phone_number?: PhoneNumberDto; // 電話番号をオプションで受け取る
}
