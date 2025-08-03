import { IsNotEmpty } from 'class-validator';

export class ReportCreateDto {
  target_user: string;
  target_post?: string;
  reason_code: string;
  reason: string;
}
