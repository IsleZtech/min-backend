import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import mongoose, { Model } from 'mongoose';
import { sendPushNotification } from 'src/Notification/notification';
import { Match, MatchDocument } from 'src/schemas/match.schema';
import { User, UsersDocument } from 'src/schemas/user.schema';
import { USER_PREVIEW_FIELDS } from 'src/user/user.service';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(User.name) private userModel: Model<UsersDocument>,
  ) {}
  async create(
    initiator_user: string,
    target_user: string,
    action: 0 | 1,
  ): Promise<boolean> {
    try {
      const initiatorId = new mongoose.Types.ObjectId(initiator_user);
      const targetId = new mongoose.Types.ObjectId(target_user);
      await this.matchModel.findOneAndUpdate(
        { initiator_user: initiatorId, target_user: targetId },
        { action },
        { upsert: true, new: true },
      );
      if (action === 0) return false;
      const partner = await this.matchModel.findOne({
        initiator_user: targetId,
        target_user: initiatorId,
      });
      sendPushNotification(this.userModel, 'like', target_user, initiator_user);
      return partner?.action === 2;
    } catch (error) {
      throw new InternalServerErrorException(
        `処理中に何らかのエラー：${error}`,
      );
    }
  }

  async fetchAllLikedMeUsers(myId: string): Promise<any[]> {
    try {
      const id = new mongoose.Types.ObjectId(myId);
      const swipedUsers = await this.fetchAlreadySwipedUsers(id);
      return this.fetchLikedMeUsers(id, swipedUsers, 999);
    } catch (error) {
      throw new InternalServerErrorException(
        `処理中に何らかのエラー：${error}`,
      );
    }
  }

  async refetchOnNotification(myId: string): Promise<any> {
    try {
      const id = new mongoose.Types.ObjectId(myId);
      const swipedUsers = await this.fetchAlreadySwipedUsers(id);
      const matchingUsers = this.fetchMatchingUsers(id, swipedUsers);
      const likedMeUsers = this.fetchLikedMeUsers(id, swipedUsers, 999);
      return {
        matching_users: matchingUsers,
        liked_me_user: {
          count: Array.isArray(likedMeUsers) ? likedMeUsers.length : 0,
          users: likedMeUsers,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `処理中に何らかのエラー：${error}`,
      );
    }
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // その他
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//

  //すでにスワイプをした人のIDのリストを返す
  async fetchAlreadySwipedUsers(id: mongoose.Types.ObjectId): Promise<any[]> {
    return await this.matchModel
      .find({ initiator_user: id }, 'target_user action')
      .lean()
      .exec();
  }

  //自分がいいねした人だけのIdを返す
  async likeUserIds(swipedUsers: any[]): Promise<mongoose.Types.ObjectId[]> {
    return swipedUsers
      .filter(m => m.action === 2)
      .map(m => m.target_user as mongoose.Types.ObjectId);
  }

  async nopeUserIds(swipedUsers: any[]): Promise<mongoose.Types.ObjectId[]> {
    return swipedUsers
      .filter(m => m.action !== 0)
      .map(m => m.target_user as mongoose.Types.ObjectId);
  }

  //自分のことをいいねしていて、自分は何もアクションしてない人数を返す
  async fetchLikedMeUserCount(
    id: mongoose.Types.ObjectId,
    swipedUsers: any[],
  ): Promise<number> {
    return this.matchModel.countDocuments({
      target_user: id,
      action: 2,
      initiator_user: { $nin: await this.nopeUserIds(swipedUsers) },
    });
  }
  //自分のことをいいねしていて、自分は何もアクションしてないユーザーを返す
  async fetchLikedMeUsers(
    id: mongoose.Types.ObjectId,
    swipedUsers: any[],
    limit: number,
  ): Promise<any[]> {
    const initiatorFind = { $nin: await this.nopeUserIds(swipedUsers) };
    const find = { target_user: id, action: 2, initiator_user: initiatorFind };
    const users = await this.matchModel
      .find(find, 'initiator_user')
      .populate([{ path: 'initiator_user', ...USER_PREVIEW_FIELDS }])
      .limit(limit)
      .lean()
      .exec();
    return users.map(m => m.initiator_user);
  }
  // matchingしたユーザーを返す
  async fetchMatchingUsers(
    id: mongoose.Types.ObjectId,
    swipedUsers: any[],
  ): Promise<any[]> {
    const initiatorFind = { $in: await this.likeUserIds(swipedUsers) };
    const find = { target_user: id, action: 2, initiator_user: initiatorFind };
    const users = await this.matchModel
      .find(find, 'initiator_user')
      .populate([{ path: 'initiator_user', ...USER_PREVIEW_FIELDS }])
      .lean()
      .exec();
    return users.map(m => m.initiator_user);
  }
}
