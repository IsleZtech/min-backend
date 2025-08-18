import admin from 'firebase-admin';
import mongoose, { Model } from 'mongoose';
import { title } from 'process';
import { getFirebaseApp } from 'src/firebase/firebase';
import { UsersDocument } from 'src/schemas/user.schema';

export async function sendPushNotification(
  userModel: Model<UsersDocument>,
  type: 'like' | 'call',
  targetUserId: string,
  sendUserId: string,
): Promise<void> {
  try {
    const tId = new mongoose.Types.ObjectId(targetUserId);
    const sId = new mongoose.Types.ObjectId(sendUserId);
    const [tUser, sUser] = await Promise.all([
      userModel.findOne({ _id: tId }).lean(),
      userModel.findOne({ _id: sId }).lean(),
    ]);

    if (!tUser) return;

    const title = messageDatas?.[type]?.[tUser.language]?.['title'];
    const messe = messageDatas?.[type]?.[tUser.language]?.['message'];

    if (!tUser.fcm_token || !title || !messe) return;

    getFirebaseApp();

    const messeText = messe.replace(/@/g, tUser.user_name);
    const message: admin.messaging.Message = {
      token: String(tUser.fcm_token),
      notification: { title: title, body: messeText },
      data: {
        title: title,
        body: messeText,
        messageId: `${type}@${sId}@${sUser.user_name}@${sUser.profile_images[0]}`,
      },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      android: { notification: { channelId: 'default' } },
    };
    await admin.messaging().send(message);
    return;
  } catch (_) {
    return;
  }
}

const messageDatas = {
  like: {
    jp: {
      title: 'OOO',
      message: '誰かがかあなたのこといいねしました',
    },
    en: {
      title: 'OOO',
      message: 'someone gave you a like',
    },
  },
  call: {
    jp: {
      title: '🚨 いますぐタップして参加 🚨',
      message: '@さんがあなたをチャットに呼び出しています',
    },
    en: {
      title: '🚨 Tap Now to Join 🚨',
      message: '@ is calling you to the chat',
    },
  },
};
