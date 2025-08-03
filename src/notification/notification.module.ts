import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Module } from '@nestjs/common';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { AppNotificationService } from './notification.service';
import {
  AppNotification,
  AppNotificationSchema,
} from 'src/schemas/notification';
import { AppNotificationController } from './notification.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppNotification.name, schema: AppNotificationSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [AppNotificationController],
  providers: [AppNotificationService],
  exports: [AppNotificationService],
})
export class AppNotificationModule {}
