import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PhoneNumberDto {
  @Type(() => Number)
  country_code: number;

  @Type(() => Number)
  number: number;
}

export class FindUsersByPhoneDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneNumberDto)
  phone_numbers: PhoneNumberDto[];
}
