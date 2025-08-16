import {
  Body,
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatLogService } from './chat_log.service';
import mongoose from 'mongoose';
import { ChatLogUpDateDto } from './dto/chatlog-update.dto';

@Controller('chatlog')
export class ChatLogController {
  constructor(private readonly chatLogService: ChatLogService) {}

  @Post('/update/:id')
  @UsePipes(ValidationPipe)
  upDate(@Param('id') id: string, @Body() dto: ChatLogUpDateDto) {
    return this.chatLogService.upDate(id, dto);
  }
}
