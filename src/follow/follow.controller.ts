import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FollowService } from './follow.service';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('/:id')
  async toggleFollowStatus(
    @Param('id') initiatorId: string,
    @Query('target_id') targetId: string,
    @Query('toggle') toggle: 'add' | 'delete',
  ) {
    return await this.followService.toggleFollowStatus(
      initiatorId,
      targetId,
      toggle,
    );
  }

  @Get('/:id')
  async fetchFollow(@Param('id') initiatorId: string) {
    return await this.followService.fetchFollow(initiatorId);
  }

  @Post('/mutual/:id')
  async fetchMutualUsers(@Param('id') id: string) {
    return await this.followService.fetchMutualUsers(id);
  }
  @Post('/request/:id')
  async fetchRequestUsers(@Param('id') id: string) {
    return await this.followService.fetchRequestUsers(id);
  }
}
