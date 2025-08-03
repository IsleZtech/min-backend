import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MuteService } from './mute.service';

@Controller('mute')
export class MuteController {
  constructor(private readonly MuteService: MuteService) {}

  @Post('/:id')
  async toggleMuteStatus(
    @Param('id') initiatorId: string,
    @Query('target_id') targetId: string,
    @Query('toggle') toggle: 'add' | 'delete',
  ) {
    return await this.MuteService.toggleMuteStatus(
      initiatorId,
      targetId,
      toggle,
    );
  }
  @Get('/:id')
  async getMuteUsers(@Param('id') initiatorId: string) {
    return await this.MuteService.getMuteUsers(initiatorId);
  }
}
