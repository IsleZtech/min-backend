import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import mongoose, { Model } from 'mongoose';
import { ChatLog, ChatLogDocument } from 'src/schemas/chat_log';
import { Match, MatchDocument } from 'src/schemas/match.schema';
import { USER_PREVIEW_FIELDS } from 'src/user/user.service';
import { ChatLogUpDateDto } from './dto/chatlog-update.dto';

@Injectable()
export class ChatLogService {
  constructor(
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLogDocument>,
  ) {}

  async upDate(id: string, dto: ChatLogUpDateDto): Promise<ChatLog> {
    try {
      const initiatorId = new mongoose.Types.ObjectId(dto.initiator_user);
      const targetId = new mongoose.Types.ObjectId(dto.target_user);
      const or1 = { initiator_user: initiatorId, target_user: targetId };
      const or2 = { initiator_user: targetId, target_user: initiatorId };
      const logs = await this.chatLogModel.findOne({ $or: [or1, or2] });
      if (logs) {
        Object.assign(logs, dto);
        logs.markModified('updatedAt');
        await logs.save();
      } else {
        await this.chatLogModel.create(dto);
      }
      return this.fetchFindOneChatLog(id, dto);
    } catch (error) {
      throw new InternalServerErrorException(
        `処理中に何らかのエラー：${error}`,
      );
    }
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // その他
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  transformData(myId: mongoose.Types.ObjectId, log: any): any {
    const isInitiator = log.initiator_user['_id'].equals(myId);
    return {
      id: log._id,
      user: isInitiator ? log.target_user : log.initiator_user,
      role: isInitiator ? 'initiator' : 'target',
      status: log.status,
      cancelled_user: log.cancelled_user,
      chat_duration: log.chat_duration,
      created_at: log.updatedAt,
    };
  }

  async fetchFindOneChatLog(id: string, dto: ChatLogUpDateDto): Promise<any> {
    const initiatorId = new mongoose.Types.ObjectId(dto.initiator_user);
    const targetId = new mongoose.Types.ObjectId(dto.target_user);
    const or1 = { initiator_user: initiatorId, target_user: targetId };
    const or2 = { initiator_user: targetId, target_user: initiatorId };
    const populate1 = { path: 'initiator_user', ...USER_PREVIEW_FIELDS };
    const populate2 = { path: 'target_user', ...USER_PREVIEW_FIELDS };
    const log = await this.chatLogModel
      .findOne({ $or: [or1, or2] })
      .populate([populate1, populate2])
      .lean()
      .exec();

    return this.transformData(new mongoose.Types.ObjectId(id), log);
  }
  async fetchChatLogs(id: mongoose.Types.ObjectId): Promise<any[]> {
    const find = { $or: [{ initiator_user: id }, { targe_user: id }] };
    const populate1 = { path: 'initiator_user', ...USER_PREVIEW_FIELDS };
    const populate2 = { path: 'target_user', ...USER_PREVIEW_FIELDS };
    const logs = await this.chatLogModel
      .find(find)
      .populate([populate1, populate2])
      .lean()
      .exec();
    return logs.map(m => this.transformData(id, m));
  }
}
