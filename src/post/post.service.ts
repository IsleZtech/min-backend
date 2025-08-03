import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import mongoose, { Model } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { CreatePostsDto } from './dto/post-create.dto';
import { Follow, FollowDocument } from 'src/schemas/follow.schema';
import { MongoError } from 'mongodb';
import { User, UsersDocument } from 'src/schemas/user.schema';
import { PostUpdateDto } from './dto/post-update.dto';
import { Block, BlockDocument } from 'src/schemas/block.schema';
import { FollowService } from 'src/follow/follow.service';
import { BlockService } from 'src/block/block.service';
import { AppNotificationService } from 'src/notification/notification.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(User.name) private userModel: Model<UsersDocument>,
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
    private readonly followService: FollowService,
    private readonly blockService: BlockService,
    private readonly appNotificationService: AppNotificationService,
  ) {}

  // 新しい投稿を作成
  async createPost(
    createPostsDto: CreatePostsDto,
    userId: string,
  ): Promise<any> {
    try {
      const blockMap = new Map();
      await Promise.all(
        createPostsDto.posts.flatMap(postDto =>
          postDto.posted_for_user.map(async id => {
            if (blockMap.get(id)) return;
            const objectId = new mongoose.Types.ObjectId(id);
            const ids = await this.blockService.getBlockUserIds(objectId);
            const privacyLevel = ids.includes(userId) ? 3 : 1;
            blockMap.set(id.toString(), { privacyLevel: privacyLevel });
          }),
        ),
      );
      const posts = await Promise.all(
        createPostsDto.posts.flatMap(postDto =>
          postDto.posted_for_user.map(async id => {
            return {
              media_url: postDto.media_url,
              media_type: postDto.media_type,
              thumbnail_url: postDto.thumbnail_url,
              posted_by_user: new mongoose.Types.ObjectId(userId),
              posted_for_user: new mongoose.Types.ObjectId(id),
              posted_at: new Date(),
              privacy_level: blockMap.get(id).privacyLevel,
            };
          }),
        ),
      );

      const result = await this.postModel.insertMany(posts);
      const postedByMes = await this.fetchPostedByMe(userId);
      const friendPosts = await this.fetchFriendPosts(userId);
      result.map(async post => {
        await this.appNotificationService.toggleAppNotificationStatus('add', {
          user_id: String(post.posted_for_user),
          sender_id: userId,
          type: 'post',
          action_url: '',
          post_id: String(post._id),
        });
      });
      return {
        friend_posts: friendPosts,
        posted_by_me: postedByMes,
      };
    } catch (error) {
      throw new Error('An error has occurred.');
    }
  }

  // 投稿へのいいねの追加、削除のAPI
  async toggleListItem(
    postId: string,
    userId: string,
    field: 'like_list' | 'view_list',
    toggle: 'add' | 'delete',
  ): Promise<Post> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    try {
      const updateOperation =
        toggle == 'add'
          ? { $addToSet: { [field]: userObjectId } }
          : { $pull: { like_list: userObjectId } };
      const updatedPost = await this.postModel.findByIdAndUpdate(
        postId,
        updateOperation,
        { new: true, runValidators: true },
      );
      if (!updatedPost) {
        throw new HttpException('Post not found', 401);
      }
      if (field == 'like_list') {
        [updatedPost.posted_for_user, updatedPost.posted_by_user].map(
          async (id, index) => {
            await this.appNotificationService.toggleAppNotificationStatus(
              toggle,
              {
                user_id: String(id),
                sender_id: userId,
                type: ['post_like_by_user', 'post_like_for_user'][index],
                action_url: '',
                post_id: postId,
              },
            );
          },
        );
      }
      return updatedPost;
    } catch (error) {
      throw new HttpException(error, 402);
    }
  }

  //特定のユーザーの投稿のListを取得
  async getPosts(targetId: string, initiatorId: string): Promise<any[]> {
    try {
      const userPopulate = {
        select: '_id user_name profile_image is_public_account',
      };
      const [targetUser, isFollower, isFollowing, posts] = await Promise.all([
        this.userModel.findOne({ _id: targetId }).select('best_friends').lean(),
        this.followModel.findOne({ initiator: initiatorId, target: targetId }),
        this.followModel.findOne({ initiator: targetId, target: initiatorId }),
        this.fetchPosts({ posted_for_user: targetId }, userPopulate),
      ]);
      const targetInfoMap = new Map();
      targetInfoMap.set(targetId, {
        isFollower: isFollower,
        isFollowing: isFollowing,
        bestFriendIds: targetUser?.best_friends?.map(id => id.toString()) || [],
      });
      return this.filterPermission(initiatorId, targetInfoMap, posts);
    } catch (e) {
      throw new Error('An error has occurred.');
    }
  }

  //特定の複数の投稿データの閲覧といいねのListを取得する
  async getPostsActivitiesByIds(ids: string[]): Promise<any[]> {
    try {
      const userPopulate = { select: '_id user_name profile_image' };
      return await this.postModel
        .find({ _id: { $in: ids } })
        .select('view_list like_list')
        .populate([
          { path: 'view_list', ...userPopulate },
          { path: 'like_list', ...userPopulate },
        ])
        .exec();
    } catch (error) {
      throw new Error('Unable to retrieve friends');
    }
  }

  //投稿のデータを更新する
  async updatePost(
    postId: string,
    postUpdateDto: PostUpdateDto,
  ): Promise<PostDocument> {
    try {
      const userPopulate = { select: '_id user_name profile_image' };
      return await this.postModel
        .findByIdAndUpdate(postId, { $set: postUpdateDto }, { new: true })
        .populate([
          { path: 'posted_by_user', ...userPopulate },
          { path: 'posted_for_user', ...userPopulate },
        ])
        .exec();
    } catch (error) {
      throw new Error('Unable to retrieve friends');
    }
  }
  //投稿のデータを削除
  async deletePost(postId: string): Promise<void> {
    try {
      await this.postModel.findByIdAndDelete(postId).exec();
    } catch (error) {
      throw new Error('delete post');
    }
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  //＊＊＊＊＊＊＊＊＊＊＊＊PostModelに付随するその他関数＊＊＊＊＊＊＊＊＊＊＊＊//
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//

  ////投稿を取得する基本的な型////
  async fetchPosts(query: any, customPopulate?: any): Promise<any[]> {
    let userPopulate: any = { select: '_id user_name profile_image' };
    if (customPopulate) userPopulate = customPopulate;
    const results = await this.postModel
      .find(query)
      .populate([
        { path: 'posted_for_user', ...userPopulate },
        { path: 'posted_by_user', ...userPopulate },
      ])
      .sort({ createdAt: -1 })
      .exec();
    return results.filter(
      post => post.posted_by_user != null && post.posted_for_user != null,
    );
  }

  ////友達の投稿を取得して、権限別にフィルタリング////
  async fetchFriendPosts(myId: string): Promise<any[]> {
    const last24Hours = { $gte: new Date(Date.now() - 86400000) };
    const followingUsers = await this.followService.getFollowingUsers(myId);
    const followingIds = followingUsers.map(user => user.target['_id']);
    const userPopulate = {
      select: '_id user_name profile_image is_public_account',
    };
    const query = {
      posted_for_user: { $in: followingIds },
      createdAt: last24Hours,
    };
    //友達が投稿された投稿を取得
    const friendPosts = await this.fetchPosts(query, userPopulate);

    //関係性をまとめる
    const targetInfoMap = new Map();
    await Promise.all(
      followingUsers.map(async followData => {
        const targetId = followData.target['_id'];
        const bestFriends = followData.target['best_friends'];
        const isFollower = await this.followService.getIsFollow(targetId, myId);
        const bestFriendIds = bestFriends?.map(id => id.toString()) || [];
        targetInfoMap.set(targetId.toString(), {
          isFollower: !!isFollower,
          isFollowing: true,
          bestFriendIds,
        });
      }),
    );
    return this.filterPermission(myId, targetInfoMap, friendPosts);
  }

  ////自分が投稿を作成したの投稿をすべて取得する////
  async fetchPostedByMe(myId: string): Promise<any[]> {
    return this.fetchPosts({ posted_by_user: myId });
  }

  ////過去24時間で自分が投稿されたものを取得する////
  async fetchPostedForMe(myId: string): Promise<any[]> {
    const last24Hours = { $gte: new Date(Date.now() - 86400000) };
    return this.fetchPosts({ posted_for_user: myId, createdAt: last24Hours });
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  //＊＊＊＊＊＊＊＊＊＊＊その他関数＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//

  ////投稿を、権限別にフィルタリング////
  async filterPermission(
    myId: string,
    targetInfoMap: Map<
      string,
      { isFollower: boolean; isFollowing: boolean; bestFriendIds: string[] }
    >,
    posts: any[],
  ): Promise<any[]> {
    return posts.filter(post => {
      const targetId = post.posted_for_user['_id'].toString();
      const posterId = post.posted_by_user['_id'].toString();
      const isPublicAccount = post.posted_for_user['is_public_account'];
      const info = targetInfoMap.get(targetId);
      if (!info) return false;
      const { isFollower, isFollowing, bestFriendIds } = info;
      const isMutual = isFollower && isFollowing;
      // 自分が投稿者なら常に表示可能
      if (myId === posterId) return true;
      // 自分が投稿対象者なら常に表示可能
      if (myId === targetId) return true;
      // 全ての人に公開
      if (post.privacy_level === 0) {
        // 公開アカウントなら誰でも見られる
        if (isPublicAccount) return true;
        // 非公開アカウントなら相互フォローの人だけ見られる
        return isMutual;
      }
      // 相互フォローのみ
      if (post.privacy_level === 1 && isMutual) return true;
      // 限定友達のみ
      if (post.privacy_level === 2 && bestFriendIds.includes(myId)) return true;
      return false;
    });
  }
}
