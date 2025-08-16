import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportCreateDto } from './dto/create.dto';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('/create')
  @UsePipes(ValidationPipe)
  createReport(@Body() createDto: ReportCreateDto) {
    return this.reportService.create(createDto);
  }
}
