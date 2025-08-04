import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Module } from '@nestjs/common';
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
  ],
  controllers: [AppNotificationController],
  providers: [AppNotificationService],
  exports: [AppNotificationService],
})
export class AppNotificationModule {}
