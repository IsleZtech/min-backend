import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { User, UsersDocument } from 'src/schemas/user.schema';
import mongoose, { isValidObjectId, Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist';
import { UserUpdateDto } from './dto/user-update.dto';
import { Block, BlockDocument } from 'src/schemas/block.schema';
import { Mute, MuteDocument } from 'src/schemas/mute.schema';
import { Follow, FollowDocument } from 'src/schemas/follow.schema';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { FindFriendsByPhoneDto } from './dto/user-friendsbyphones.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { Delete, DeleteDocument } from 'src/schemas/delete.schema';
import { PostService } from 'src/post/post.service';
import { FollowService } from 'src/follow/follow.service';
import { MuteService } from 'src/mute/mute.service';
import { Report, ReportDocument } from 'src/schemas/report.schema';
import { DeleteCreateDto } from 'src/delete/dto/create.dto';
import { BlockService } from 'src/block/block.service';
import { AppNotificationService } from 'src/notification/notification.service';
import {
  AppNotification,
  AppNotificationDocument,
} from 'src/schemas/notification';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UsersDocument>,
    @InjectModel(Mute.name) private muteModel: Model<MuteDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Delete.name) private deleteModel: Model<DeleteDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
    @InjectModel(AppNotification.name)
    private appNotificationModel: Model<AppNotificationDocument>,
    private readonly postService: PostService,
    private readonly followService: FollowService,
    private readonly muteService: MuteService,
    private readonly blockService: BlockService,
  ) {}

  //特定のユーザーをidからデータ取得
  async findById(targetId: string, initiatorId: string): Promise<any> {
    try {
      const query = { posted_for_user: targetId };
      const select = '_id user_name profile_image is_public_account';
      const userData = await this.userModel.findById(targetId).exec();
      if (!userData) throw new NotFoundException('ユーザーが存在しません');
      const [isFollower, isFollowing, posts] = await Promise.all([
        this.followService.getIsFollow(initiatorId, targetId),
        this.followService.getIsFollow(targetId, initiatorId),
        this.postService.fetchPosts(query, { select: select }),
      ]);
      const infoMap = new Map();
      infoMap.set(targetId, {
        isFollower: isFollower,
        isFollowing: isFollowing,
        bestFriendIds: userData.best_friends?.map(id => id.toString()) || [],
      });
      const topSupporter = await this.getTopPosters(posts);
      const postList = await this.postService.filterPermission(
        initiatorId,
        infoMap,
        posts,
      );
      return {
        user: {
          ...userData.toObject(),
          top_supporter: topSupporter,
        },
        post_list: postList,
      };
    } catch (error) {
      throw new Error('Unable to retrieve friends');
    }
  }
  //特定のユーザーをPinCodeからデータ取得
  async findByPinCode(
    targetPinCode: string,
    initiatorId: string,
  ): Promise<any> {
    try {
      const userDataQuery = { pin_code: targetPinCode };
      const select = '_id user_name profile_image is_public_account';
      const userData = await this.userModel.findOne(userDataQuery).exec();
      if (!userData) throw new NotFoundException('ユーザーが存在しません');
      const id = userData._id.toString();
      const query = { posted_for_user: id, posted_by_use: initiatorId };
      const [isFollower, isFollowing, posts] = await Promise.all([
        this.followService.getIsFollow(initiatorId, id),
        this.followService.getIsFollow(id, initiatorId),
        this.postService.fetchPosts(query, { select: select }),
      ]);
      const infoMap = new Map();
      infoMap.set(id, {
        isFollower: isFollower,
        isFollowing: isFollowing,
        bestFriendIds: userData.best_friends?.map(id => id.toString()) || [],
      });
      const topSupporter = await this.getTopPosters(posts);
      const postList = await this.postService.filterPermission(
        initiatorId,
        infoMap,
        posts,
      );
      return {
        user: {
          ...userData.toObject(),
          top_supporter: topSupporter,
        },
        post_list: postList,
      };
    } catch (error) {
      throw new Error('Unable to retrieve friends');
    }
  }
  //ユーザーを電話番号のデータリストから取得する
  async friendsByPhones(
    friendsByPhonesDto: FindFriendsByPhoneDto,
  ): Promise<any> {
    try {
      const phoneConditions = friendsByPhonesDto.phoneNumbers.map(phone => ({
        'phone_number.country_code': phone.country_code,
        'phone_number.number': phone.number,
      }));
      return this.fetchUser({
        $or: phoneConditions,
        is_phone_number_searchable: true,
      });
    } catch (error) {
      throw new Error('Unable to retrieve friends');
    }
  }

  //ユーザーをobjectIDのリストから取得する
  async friendsByIds(friendsByIds: string[]): Promise<UsersDocument[]> {
    try {
      return this.fetchUser({ _id: { $in: friendsByIds } });
    } catch (error) {
      throw new Error('Unable to retrieve friends');
    }
  }

  //ユーザーをidまたは、名前から検索
  async searchUser(input: string): Promise<UsersDocument[]> {
    try {
      const conditions = [];
      conditions.push({ pin_code: new RegExp(input, 'i') });
      conditions.push({ user_name: new RegExp(input, 'i') });
      conditions.push({ 'phone_number.number': new RegExp(input, 'i') });
      return this.userModel.find({ $or: conditions }).exec();
    } catch (error) {
      throw new Error('Unable to retrieve friends');
    }
  }

  //アプリが立ち上がるときに取得するAPI
  async startupData(
    uid: string,
    fcm_token: string,
    language: string,
  ): Promise<any> {
    const userData = await this.userModel.findOne({ uid: uid }).exec();
    if (!userData) throw new NotFoundException('ユーザーが存在しません');
    const [
      myPostList,
      postedByMe,
      friendPosts,
      muteUsers,
      blockUsers,
      followingUsers,
      followerUsers,
    ] = await Promise.all([
      this.postService.fetchPosts({ posted_for_user: userData._id }),
      this.postService.fetchPostedByMe(userData._id.toString()),
      this.postService.fetchFriendPosts(userData._id.toString()),
      this.muteService.getMuteUsers(userData._id.toString()),
      this.blockService.getTargetUsers(userData._id.toString()),
      this.followService.getFollowUser(userData._id, 'following'),
      this.followService.getFollowUser(userData._id, 'follower', true),
    ]);
    const topSupporter = await this.getTopPosters(myPostList);
    if (userData.fcm_token !== fcm_token) userData.fcm_token = fcm_token;
    if (!userData.pin_code) {
      userData.pin_code = await this.generateUniquePinCode();
    }
    userData.language = language;
    await userData.save();
    const followingIdSet = new Set(followingUsers.map(u => u._id.toString()));
    return {
      user: {
        ...userData.toObject(),
        top_supporter: topSupporter,
        following: followingUsers,
        followers: followerUsers,
      },
      my_posts: {
        _id: userData._id,
        user_name: userData.user_name,
        profile_image: userData.profile_image,
        post_list: myPostList,
      },
      posted_by_me: postedByMe,
      friend_posts: friendPosts,
      mutes: muteUsers,
      block: blockUsers,
      request_users: followerUsers.filter(data => {
        return !followingIdSet.has(data._id.toString());
      }),
    };
  }
  //電話番号のサインアップとログインの処理
  async phoneAuthenticate(
    userCreateDto: UserCreateDto,
  ): Promise<UsersDocument> {
    try {
      const user = await this.userModel.findOne({ uid: userCreateDto.uid });
      if (user) {
        if (!user.pin_code) {
          user.pin_code = await this.generateUniquePinCode();
        }
        user.is_login = true;
        user.is_deleted = false;
        user.login_date = new Date();
        user.fcm_token = userCreateDto.fcm_token;
        user.language = userCreateDto.language;
        return user.save();
      }
      const pin = await this.generateUniquePinCode();
      const newUser = new this.userModel({
        ...userCreateDto,
        is_login: true,
        pin_code: pin,
        is_deleted: false,
        login_date: new Date(),
      });
      return newUser.save();
    } catch (error) {
      throw new Error('Unable to retrieve friends');
    }
  }

  async logoutUser(userId: string): Promise<unknown> {
    const logoutUser = await this.userModel.findByIdAndUpdate(
      userId,
      { is_login: false },
      { new: true },
    );
    if (!logoutUser) {
      throw new NotFoundException(
        `ユーザーIDに対応するユーザ情報が見つかりません`,
      );
    }
    return logoutUser;
  }

  //ユーザー情報更新
  async updateUser(
    userId: string,
    userUpdateDto: UserUpdateDto,
  ): Promise<UsersDocument> {
    if (!isValidObjectId(userId))
      throw new NotFoundException('無効なユーザーIDです');
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: userUpdateDto }, { new: true })
      .exec();
    if (!updatedUser) throw new NotFoundException('ユーザーが見つかりません');
    if (!updatedUser.is_login)
      throw new HttpException('このユーザーはログインしていません。', 403);
    return updatedUser;
  }

  //自分のユーザーデータの再取得
  async refetch(id: string): Promise<any> {
    const userData = await this.userModel.findOne({ _id: id }).exec();
    if (!userData) throw new NotFoundException('ユーザーが存在しません');
    const [
      myPostList,
      postedByMe,
      muteUsers,
      blockUsers,
      followingUsers,
      followerUsers,
    ] = await Promise.all([
      this.postService.fetchPosts({ posted_for_user: userData._id }),
      this.postService.fetchPostedByMe(userData._id.toString()),
      this.muteService.getMuteUsers(userData._id.toString()),
      this.blockService.getTargetUsers(userData._id.toString()),
      this.followService.getFollowUser(userData._id, 'following'),
      this.followService.getFollowUser(userData._id, 'follower', true),
    ]);
    const topSupporter = await this.getTopPosters(myPostList);
    const followingIdSet = new Set(followingUsers.map(u => u._id.toString()));
    return {
      user: {
        ...userData.toObject(),
        top_supporter: topSupporter,
        following: followingUsers,
        followers: followerUsers,
      },
      my_posts: {
        _id: userData._id,
        user_name: userData.user_name,
        profile_image: userData.profile_image,
        post_list: myPostList,
      },
      posted_by_me: postedByMe,
      mutes: muteUsers,
      block: blockUsers,
      request_users: followerUsers.filter(data => {
        return !followingIdSet.has(data._id.toString());
      }),
    };
  }

  //即時アカウント削除
  async deleteAccount(
    id: string,
    deleteCreateDto: DeleteCreateDto,
  ): Promise<any> {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const postedByUser = { posted_by_user: objectId };
      const postedForUser = { posted_for_user: objectId };
      const viewList = { view_list: objectId };
      const likeList = { like_list: objectId };
      const postFind = { $or: [postedByUser, postedForUser] };
      const initiatorUser = { initiator_user: objectId };
      const targetUser = { target_user: objectId };
      const deletedPosts = await this.postModel.find(postFind).exec();
      const deletedPostIds = deletedPosts.map(r => r._id.toString());
      const targetPost = { target_post: { $in: deletedPostIds } };
      const reportsFind = { $or: [initiatorUser, targetUser, targetPost] };
      const find = { $or: [{ initiator: objectId }, { target: objectId }] };

      await this.muteModel.deleteMany(find).exec(); //非表示の削除
      await this.followModel.deleteMany(find).exec(); //フォローの削除
      await this.blockModel.deleteMany(find).exec(); //ブロックの削除
      await this.postModel.deleteMany({ _id: { $in: deletedPostIds } }); //投稿の削除
      await this.postModel.updateMany(viewList, { $pull: viewList }); //投稿のview_listから削除
      await this.postModel.updateMany(likeList, { $pull: likeList }); //投稿のlike_listから削除
      await this.reportModel.deleteMany(reportsFind).exec(); //通報の削除
      await this.userModel.findByIdAndDelete(objectId); //アカウント削除
      await this.appNotificationModel.deleteMany({
        $or: [{ sender_id: objectId }, { user_id: objectId }],
      });
      await this.deleteModel.create(deleteCreateDto);
    } catch (error) {
      throw new Error('error');
    }
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  //UserModelに付随するその他関数
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//

  ////ユーザーを取得する基本的な型////
  async fetchUser(query: any): Promise<any> {
    return this.userModel.find({ ...query, is_deleted: false }).exec();
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  //その他
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//

  //ベストフレンドを取得する
  //トップサポーターを取得する
  async getTopPosters(posts: any[]): Promise<any[]> {
    const postersMap = posts.reduce((acc, post) => {
      const poster = post.posted_by_user;
      if (!poster) return acc;
      const posterId = poster._id;
      if (!acc.has(posterId)) {
        acc.set(posterId, {
          poster: poster, // poster全体を保存
          postCount: 0,
          likeCount: 0,
          latestPostDate: null,
        });
      }
      const data = acc.get(posterId);
      data.postCount += 1;
      data.likeCount += post.like_list?.length || 0;
      const postDate = new Date(post.createdAt);
      if (!data.latestPostDate || postDate > data.latestPostDate) {
        data.latestPostDate = postDate;
      }

      return acc;
    }, new Map());

    if (postersMap.size === 0) {
      return [];
    }
    // ソートしてトップ3を返す
    const ss = Array.from(postersMap.values())
      .sort((a, b) => {
        return b['postCount'] !== a['postCount']
          ? b['postCount'] - a['postCount']
          : b['likeCount'] !== a['likeCount']
            ? b['likeCount'] - a['likeCount']
            : b['latestPostDate'] - a['latestPostDate'];
      })
      .slice(0, 3)
      .map(data => data['poster']);
    return ss;
  }

  //ピンコードの生成
  async generateUniquePinCode(): Promise<string> {
    const letters = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    let pinCode = '';
    let isUnique = false;

    while (!isUnique) {
      pinCode = '';
      let hasNumber = false;
      for (let i = 0; i < 7; i++) {
        if (i === 6 && !hasNumber) {
          pinCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
        } else {
          if (Math.random() < 0.3) {
            pinCode += numbers.charAt(
              Math.floor(Math.random() * numbers.length),
            );
            hasNumber = true;
          } else {
            pinCode += letters.charAt(
              Math.floor(Math.random() * letters.length),
            );
          }
        }
      }
      const exists = await this.userModel.exists({ pin_code: pinCode });
      isUnique = !exists;
    }

    return pinCode;
  }
}
