import {
  Body,
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('/create')
  @UsePipes(ValidationPipe)
  startupData(
    @Body()
    matchDto: {
      initiator_user: string;
      target_user: string;
      action: 0 | 1;
    },
  ) {
    return this.matchService.create(
      matchDto.initiator_user,
      matchDto.target_user,
      matchDto.action,
    );
  }
  @Post('/fetch/likedmeusers')
  @UsePipes(ValidationPipe)
  fetchAllLikedMeUsers(@Body() body: { id: string }) {
    return this.matchService.fetchAllLikedMeUsers(body.id);
  }

  @Post('/fetch/notification')
  @UsePipes(ValidationPipe)
  refetchOnNotification(@Body() body: { id: string }) {
    return this.matchService.refetchOnNotification(body.id);
  }
}
