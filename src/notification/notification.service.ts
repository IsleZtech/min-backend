import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import mongoose, { Model } from 'mongoose';
import admin from 'firebase-admin';
import {
  AppNotification,
  AppNotificationDocument,
} from 'src/schemas/notification';
import { AppNotificationCreateDto } from './dto/notification-create.dto';
import { User, UsersDocument } from 'src/schemas/user.schema';

@Injectable()
export class AppNotificationService {
  constructor(
    @InjectModel(AppNotification.name)
    private appNotificationModel: Model<AppNotificationDocument>,
    // @InjectModel(User.name) private userModel: Model<UsersDocument>,
  ) {}
  // async toggleAppNotificationStatus(
  //   toggle: 'add' | 'delete',
  //   createDto: AppNotificationCreateDto,
  // ): Promise<void> {
  //   try {
  //     //全く同じやつがあるかどうか
  //     const appNotification = await this.existinAppNotification(createDto);
  //     if (toggle == 'add') {
  //       if (appNotification) {
  //         //10分以内ではない
  //         appNotification.is_read = false;
  //         appNotification.is_clicked = false;
  //         appNotification.is_active = true;
  //         await appNotification.save();
  //       } else {
  //         const newAppNotification = new this.appNotificationModel(createDto);
  //         await newAppNotification.save();
  //       }
  //       this.sendPushNotification(createDto);
  //     }

  //     if (appNotification && toggle == 'delete') {
  //       appNotification.is_active = false;
  //     }
  //   } catch (_) {
  //     throw new Error('An error has occurred.');
  //   }
  // }

  // async getAppNotifications(userId: string): Promise<AppNotification[]> {
  //   const find = { user_id: new mongoose.Types.ObjectId(userId) };
  //   return this.fetchAppNotification(find);
  // }

  // async delete(id: string, userId: string): Promise<AppNotification[]> {
  //   const deleteFind = { _id: new mongoose.Types.ObjectId(id) };
  //   const find = { user_id: new mongoose.Types.ObjectId(userId) };
  //   await this.appNotificationModel.deleteOne(deleteFind);
  //   return this.fetchAppNotification(find);
  // }

  // async allRead(userId: string): Promise<AppNotification[]> {
  //   const find = { user_id: new mongoose.Types.ObjectId(userId) };
  //   await this.appNotificationModel.updateMany(find, {
  //     $set: { is_read: true },
  //   });
  //   return this.fetchAppNotification(find);
  // }
  // //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // //＊＊＊＊＊＊＊＊＊＊＊その他関数＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//

  // //データを取得する
  // async fetchAppNotification(find: any): Promise<AppNotification[]> {
  //   const userPopulate = { select: '_id user_name profile_image' };
  //   const byUser = { path: 'posted_by_user', ...userPopulate };
  //   const forUser = { path: 'posted_for_user', ...userPopulate };
  //   return await this.appNotificationModel
  //     .find(find)
  //     .populate([
  //       { path: 'sender_id', ...userPopulate },
  //       { path: 'post_id', populate: [byUser, forUser] },
  //     ])
  //     .sort({ createdAt: -1 })
  //     .exec();
  // }

  // //既存のデータがあればそれを返す
  // async existinAppNotification(
  //   createDto: AppNotificationCreateDto,
  // ): Promise<AppNotificationDocument> {
  //   const userId = new mongoose.Types.ObjectId(String(createDto.user_id));
  //   const searchConditions: any = {
  //     user_id: userId,
  //     type: createDto.type,
  //   };
  //   if (createDto.sender_id) {
  //     const senderId = new mongoose.Types.ObjectId(String(createDto.sender_id));
  //     searchConditions.sender_id = senderId;
  //   }
  //   if (createDto.post_id) {
  //     const postId = new mongoose.Types.ObjectId(String(createDto.post_id));
  //     searchConditions.post_id = postId;
  //   }
  //   return await this.appNotificationModel.findOne(searchConditions);
  // }
  // //10分以内かどうか
  // async isWithinLastTenMinutes(
  //   data: AppNotificationDocument,
  // ): Promise<boolean> {
  //   if (!data.createdAt) return false;
  //   const now = new Date();
  //   const createdAt = data.createdAt;
  //   const differenceInMinutes =
  //     (now.getTime() - createdAt.getTime()) / (1000 * 60);
  //   return differenceInMinutes < 10;
  // }

  // //通知を送る関数
  // async sendPushNotification(
  //   createDto: AppNotificationCreateDto,
  // ): Promise<boolean> {
  //   const senderUserid = new mongoose.Types.ObjectId(
  //     String(createDto.sender_id),
  //   );

  //   const senderUser = await this.userModel.findOne({ _id: senderUserid });
  //   const userId = new mongoose.Types.ObjectId(String(createDto.user_id));
  //   const user = await this.userModel.findOne({ _id: userId });
  //   const body =
  //     messageDatas[createDto.type][user.language == '日本語' ? 'jp' : 'en'];
  //   if (!senderUser || !user.fcm_token) return;
  //   try {
  //     if (!admin.apps.length) {
  //       const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  //       await admin.initializeApp({
  //         credential: admin.credential.cert(require(key)),
  //       });
  //     }
  //     // 通知メッセージの構成
  //     const message = {
  //       notification: {
  //         title: 'sup.',
  //         body: body.replace(/@/g, senderUser.user_name),
  //         image: createDto.type != 'post' ? senderUser.profile_images[0] : null,
  //       },
  //       data: {
  //         title: 'sup.',
  //         body: body.replace(/@/g, senderUser.user_name),
  //         clickAction: 'OPEN_MESSAGE_PAGE',
  //         messageId: `${createDto.type}@${createDto.user_id}`,
  //       },
  //       apns: {
  //         payload: {
  //           aps: {
  //             contentAvailable: true,
  //             badge: 1,
  //             sound: 'default',
  //           },
  //         },
  //       },
  //       token: user.fcm_token,
  //     };
  //     await admin.messaging().send(message);
  //     return true;
  //   } catch (error) {
  //     return false;
  //   }
  // }
}

const messageDatas = {
  post: {
    jp: 'あなたについて誰かが投稿しました',
    en: 'Someone posted about you',
  },
  post_like_for_user: {
    jp: '@があなたの投稿にいいねをしました',
    en: '@ liked your post',
  },
  post_like_by_user: {
    jp: '@があなたが作成した投稿にいいねをしました',
    en: '@ liked a post you created',
  },
  follow: {
    jp: '@がフォローしました',
    en: '@ followed you',
  },
};
