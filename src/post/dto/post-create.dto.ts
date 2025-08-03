import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class PostItemDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  posted_for_user: string[];

  @IsUrl()
  @IsNotEmpty()
  media_url: string;

  @IsEnum([0, 1]) // 0または1を許容
  @IsNotEmpty()
  media_type: number;

  @IsUrl()
  @IsNotEmpty()
  thumbnail_url: string;

  lang: String;
}
export class CreatePostsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PostItemDto)
  posts: PostItemDto[];
}
