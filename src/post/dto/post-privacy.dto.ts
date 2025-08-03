import { IsEnum, IsNotEmpty } from 'class-validator';

export class PrivacyDto {
  @IsEnum([0, 1, 2]) // 0または1を許容
  privacy_level?: number;

  is_effect: boolean;
}
