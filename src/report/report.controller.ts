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

  // @Post('/user/:id')
  // @UsePipes(ValidationPipe)
  // createReport(@Param('id') id: string, @Body() createDto: ReportCreateDto) {
  //   return this.reportService.create(id, createDto);
  // }
}
