import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';

import { Delete, DeleteSchema } from 'src/schemas/delete.schema';
import { Report, ReportSchema } from 'src/schemas/report.schema';
import { BlockModule } from 'src/block/block.module';
import { Block, BlockSchema } from 'src/schemas/block.schema';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { MatchModule } from 'src/match/match.module';
import { ChatLogModule } from 'src/chat_log/chat_log.module';
import { ChatLog, ChatLogSchema } from 'src/schemas/chat_log';
import { DeleteModule } from 'src/delete/delete.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    MongooseModule.forFeature([{ name: ChatLog.name, schema: ChatLogSchema }]),
    MongooseModule.forFeature([{ name: Delete.name, schema: DeleteSchema }]),
    MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),

    MatchModule,
    ChatLogModule,
    BlockModule,
    DeleteModule,
    // AppNotificationModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}
