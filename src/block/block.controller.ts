import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BlockService } from './block.service';
import mongoose from 'mongoose';

@Controller('block')
export class BlockController {
  constructor(private readonly BlockService: BlockService) {}

  @Post('/:id')
  async toggleBlockStatus(
    @Param('id') initiatorId: string,
    @Query('target_id') targetId: string,
    @Query('toggle') toggle: 'add' | 'delete',
  ) {
    return await this.BlockService.toggleBlockStatus(
      initiatorId,
      targetId,
      toggle,
    );
  }
  @Get('/:id')
  async getTargetUsers(@Param('id') initiatorId: string) {
    const id = new mongoose.Types.ObjectId(initiatorId);
    return await this.BlockService.fetchUsers(id);
  }
}
