import { MongooseModule } from '@nestjs/mongoose';
import { Delete, DeleteSchema } from 'src/schemas/delete.schema';

import { User, UserSchema } from 'src/schemas/user.schema';
import { Module } from '@nestjs/common';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { ChatLog, ChatLogSchema } from 'src/schemas/chat_log';
import { ChatLogController } from './chat_log.controller';
import { ChatLogService } from './chat_log.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatLog.name, schema: ChatLogSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ChatLogController],
  providers: [ChatLogService],
  exports: [ChatLogService],
})
export class ChatLogModule {}
