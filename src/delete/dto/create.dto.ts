import { IsNotEmpty } from 'class-validator';

export class DeleteCreateDto {
  reason_code?: number;

  reason?: string;
}
