import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Point, User, UsersDocument } from 'src/schemas/user.schema';
import mongoose, { isValidObjectId, Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist';
import { MatchService } from 'src/match/match.service';
import { ChatLogService } from 'src/chat_log/chat_log.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { BlockService } from 'src/block/block.service';
import { UserCreateDto } from './dto/user-create.dto';
import { Block, BlockDocument } from 'src/schemas/block.schema';
import { DeleteCreateDto } from 'src/delete/dto/create.dto';
import { Delete, DeleteDocument } from 'src/schemas/delete.schema';
import { ReportDocument } from 'src/schemas/report.schema';
import { ChatLog, ChatLogDocument } from 'src/schemas/chat_log';
import { Match, MatchDocument } from 'src/schemas/match.schema';

export const USER_PREVIEW_FIELDS = {
  select: '_id user_name profile_images birthday location',
};
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UsersDocument>,
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
    @InjectModel(Delete.name) private deleteModel: Model<DeleteDocument>,
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLogDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private readonly matchService: MatchService,
    private readonly chatLogService: ChatLogService,
    private readonly blockService: BlockService,
  ) {}
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // 取得系
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // //アプリが立ち上がるときに取得するAPI
  async startupData(
    uid: string,
    fcm_token: string,
    language: string,
    location: Point,
    maxDistance: number,
  ): Promise<any> {
    const userData = await this.userModel.findOne({ uid: uid }).exec();
    if (!userData) throw new NotFoundException('ユーザーが存在しません');
    const id = userData._id;
    const swipedUsers = await this.matchService.fetchAlreadySwipedUsers(id);
    const [
      swipeUsers,
      likedMeUserCount,
      likedMeUserThumbnail,
      matchingUsers,
      chatLogs,
      blockUsers,
    ] = await Promise.all([
      this.fetchSwipeUsers(location, maxDistance, id, swipedUsers),
      this.matchService.fetchLikedMeUserCount(id, swipedUsers),
      this.matchService.fetchLikedMeUsers(id, swipedUsers, 1),
      this.matchService.fetchMatchingUsers(id, swipedUsers),
      this.chatLogService.fetchChatLogs(id),
      this.blockService.fetchUsers(id),
    ]);

    if (userData.fcm_token !== fcm_token) userData.fcm_token = fcm_token;
    userData.location = location;
    userData.language = language;

    await userData.save();
    return {
      user: userData,
      swipe_users: swipeUsers,
      liked_me_user: {
        count: likedMeUserCount,
        users: likedMeUserThumbnail,
      },
      matching_users: matchingUsers,
      chat_logs: chatLogs,
      block_users: blockUsers,
    };
  }
  //マッチングで表示するユーザーの再取得
  async swipeUsers(
    id: string,
    location: Point,
    maxDistance: number,
  ): Promise<User[]> {
    const myId = new mongoose.Types.ObjectId(id);
    const swipedUsers = await this.matchService.fetchAlreadySwipedUsers(myId);
    return this.fetchSwipeUsers(location, maxDistance, myId, swipedUsers);
  }

  //特定のユーザーのデータを取得
  async fetchUser(id: string): Promise<User> {
    const objectId = new mongoose.Types.ObjectId(id);
    return this.userModel.findOne({ _id: objectId }).exec();
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // データ更新系
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  //ユーザー情報更新
  async updateUser(
    userId: string,
    userUpdateDto: UserUpdateDto,
  ): Promise<UsersDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: userUpdateDto }, { new: true })
      .exec();
    if (!updatedUser) throw new NotFoundException('ユーザーが見つかりません');
    if (!updatedUser.is_login)
      throw new HttpException('このユーザーはログインしていません。', 403);

    return updatedUser;
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // サインアップ
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  //電話番号のサインアップの処理
  async phoneAuthenticate(
    userCreateDto: UserCreateDto,
  ): Promise<UsersDocument> {
    try {
      const user = await this.userModel.findOne({ uid: userCreateDto.uid });
      if (user) {
        user.is_login = true;
        user.is_deleted = false;
        user.login_date = new Date();
        user.fcm_token = userCreateDto.fcm_token;
        user.language = userCreateDto.language;
        return user.save();
      }
      const newUser = new this.userModel({
        ...userCreateDto,
        is_login: true,
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

  //即時アカウント削除
  async deleteAccount(
    id: string,
    deleteCreateDto: DeleteCreateDto,
  ): Promise<any> {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const find = { $or: [{ initiator: objectId }, { target: objectId }] };
      const findChatLog = {
        $or: [{ initiator_user: objectId }, { target_user: objectId }],
      };

      await this.blockModel.deleteMany(find).exec();
      await this.chatLogModel.deleteMany(findChatLog).exec();
      await this.matchModel.deleteMany(findChatLog).exec();
      await this.userModel.findByIdAndDelete(objectId);
      await this.deleteModel.create(deleteCreateDto);
    } catch (error) {
      throw new Error('error');
    }
  }

  // //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // //UserModelに付随するその他関数
  // //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//

  ////位置情報からユーザーを取得する////
  async fetchSwipeUsers(
    point: Point,
    maxDistance: number,
    myId: mongoose.Types.ObjectId,
    swipedUsers: any[],
  ): Promise<any> {
    const ids = [
      myId,
      // ...swipedUsers.map(match => match.target_user as mongoose.Types.ObjectId),
    ];
    return this.userModel
      .find({
        is_deleted: false,
        is_login: true,
        ...(ids.length > 0 && { _id: { $nin: ids } }),
        location: {
          $near: {
            $geometry: point,
            $maxDistance: maxDistance,
          },
        },
      })
      .limit(10)
      .exec();
  }
}
