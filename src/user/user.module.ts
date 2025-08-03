import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { Block, BlockSchema } from 'src/schemas/block.schema';
import { Mute, MuteSchema } from 'src/schemas/mute.schema';
import { Follow, FollowSchema } from 'src/schemas/follow.schema';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { Delete, DeleteSchema } from 'src/schemas/delete.schema';
import { PostModule } from 'src/post/post.module';
import { FollowModule } from 'src/follow/follow.module';
import { MuteModule } from 'src/mute/mute.module';
import { Report, ReportSchema } from 'src/schemas/report.schema';
import { BlockModule } from 'src/block/block.module';
import { AppNotificationModule } from 'src/notification/notification.module';
import {
  AppNotification,
  AppNotificationSchema,
} from 'src/schemas/notification';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),
    MongooseModule.forFeature([{ name: Mute.name, schema: MuteSchema }]),
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Delete.name, schema: DeleteSchema }]),
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    MongooseModule.forFeature([
      { name: AppNotification.name, schema: AppNotificationSchema },
    ]),
    FollowModule,
    PostModule,
    MuteModule,
    BlockModule,
    AppNotificationModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}
