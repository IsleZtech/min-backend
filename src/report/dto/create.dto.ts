import { IsNotEmpty } from 'class-validator';

export class ReportCreateDto {
  initiator_user: string;

  target_user: string;

  message?: Record<string, any>[];

  reason_code: string;

  reason: string;
}
