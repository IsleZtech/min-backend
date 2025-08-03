import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PostUpdateDto {
  @IsArray()
  is_effect: boolean; //エフェクトを外すかどうか。

  privacy_level: number; //プライバシーレベル（0：全ての人、1：相互、2：限定友達,3自分のみ）。
}
