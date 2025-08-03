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
import { AppNotificationService } from './notification.service';

@Controller('notification')
export class AppNotificationController {
  constructor(
    private readonly appNotificationService: AppNotificationService,
  ) {}

  @Get('/:id')
  @UsePipes(ValidationPipe)
  create(@Param('id') userId: string) {
    return this.appNotificationService.getAppNotifications(userId);
  }
  @Post('/delete/:id')
  @UsePipes(ValidationPipe)
  delete(@Param('id') id: string, @Query('user_id') userId: string) {
    return this.appNotificationService.delete(id, userId);
  }

  @Post('/all_read/:id')
  @UsePipes(ValidationPipe)
  update(@Param('id') userId: string) {
    return this.appNotificationService.allRead(userId);
  }
}
