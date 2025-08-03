import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import mongoose, { Model } from 'mongoose';
import { AppNotificationService } from 'src/notification/notification.service';
import { PostService } from 'src/post/post.service';
import { Follow, FollowDocument } from 'src/schemas/follow.schema';
import {
  AppNotification,
  AppNotificationDocument,
} from 'src/schemas/notification';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { User, UsersDocument } from 'src/schemas/user.schema';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly appNotificationService: AppNotificationService,
  ) {}
  async toggleFollowStatus(
    initiatorId: string,
    targetId: string,
    toggle: 'add' | 'delete',
  ): Promise<Follow[]> {
    try {
      const myId = new mongoose.Types.ObjectId(initiatorId);
      const isAdd = toggle === 'add';
      const isFollow = await this.getIsFollow(initiatorId, targetId);
      if (isAdd && !isFollow) await this.addFollowing(initiatorId, targetId);
      if (!isAdd && isFollow) {
        const isDeleted = await this.deleteFollowing(initiatorId, targetId);
        if (!isDeleted) throw new Error('An error has occurred.');
      }
      await this.appNotificationService.toggleAppNotificationStatus(toggle, {
        user_id: targetId,
        sender_id: initiatorId,
        type: 'follow',
        action_url: '',
      });
      return this.getFollowUser(myId, 'following');
    } catch (_) {
      throw new Error('An error has occurred.');
    }
  }

  async fetchFollow(id: string): Promise<any> {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const [following, followers] = await Promise.all([
        this.getFollowUser(objectId, 'following'),
        this.getFollowUser(objectId, 'follower'),
      ]);
      return { followers, following };
    } catch (_) {
      throw new Error('An error has occurred.');
    }
  }

  async fetchMutualUsers(id: string): Promise<any[]> {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const followingIds = await this.getFollowingIds(objectId);
      const followerUsers = await this.getFollowUser(objectId, 'follower');
      return followerUsers.filter(data => {
        return followingIds.includes(data['_id'].toString());
      });
    } catch (_) {
      throw new Error('An error has occurred.');
    }
  }
  async fetchRequestUsers(id: string): Promise<any[]> {
    try {
      const type = 'follower';
      const objectId = new mongoose.Types.ObjectId(id);
      const followingIds = await this.getFollowingIds(objectId);
      const followerUsers = await this.getFollowUser(objectId, type, true);
      return followerUsers.filter(data => {
        return !followingIds.includes(data['_id'].toString());
      });
    } catch (_) {
      throw new Error('An error has occurred.');
    }
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊FollowModelに付随するその他関数＊＊＊＊＊＊＊＊＊＊＊＊//

  // //特定の人のフォローのIDのListを取得
  async getFollowingIds(id: mongoose.Types.ObjectId): Promise<String[]> {
    const ids = await this.followModel.distinct('target', { initiator: id });
    return ids.map(target => target.toString());
  }

  //A→Bのフォローが存在するか
  async getIsFollow(initiator: string, target: string) {
    return this.followModel
      .findOne({ initiator: initiator, target: target })
      .exec();
  }

  //自分がフォローしている人のidを取得｜best_friendsも取得している
  async getFollowingUsers(initiatorId: string, targetId?: string) {
    const query: any = { initiator: initiatorId };
    if (targetId) query.target = targetId;
    return this.followModel
      .find(query)
      .populate('target', '_id best_friends')
      .exec();
  }

  //フォロワーとフォローしている最小限のユーザー情報のListを取得
  async getFollowUser(
    id: mongoose.Types.ObjectId,
    type: 'follower' | 'following',
    isAllData?: boolean,
  ): Promise<any[]> {
    const userPopulate = {
      select: '_id user_name profile_image is_public_account',
    };
    const isFollowing = type == 'following';
    const find = isFollowing ? { initiator: id } : { target: id };
    const path = isFollowing ? 'target' : 'initiator';
    const results = await this.followModel
      .find(find)
      .populate(isAllData == true ? { path } : { path: path, ...userPopulate })
      .select(path)
      .sort({ createdAt: -1 })
      .exec()
      .then(results =>
        results.map(item => (isFollowing ? item.target : item.initiator)),
      );
    return results.filter(user => user != null);
  }

  //フォローの追加
  async addFollowing(initiatorId: string, targetId?: string) {
    const relation = { initiator: initiatorId, target: targetId };
    await new this.followModel(relation).save();
  }

  //フォローの削除
  async deleteFollowing(initiatorId: string, targetId?: string) {
    const relation = { initiator: initiatorId, target: targetId };
    return await this.followModel.deleteOne(relation);
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊PostModelに付随するその他関数＊＊＊＊＊＊＊＊＊＊＊＊//

  //投稿者された投稿をすべて取得
  async getAllPostedByUser(id: String): Promise<Post[]> {
    return this.postModel
      .find({ posted_for_user: id })
      .sort({ createdAt: -1 })
      .exec();
  }
}
