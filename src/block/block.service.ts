import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import mongoose, { Model } from 'mongoose';
import { Block, BlockDocument } from 'src/schemas/block.schema';
import { USER_PREVIEW_FIELDS } from 'src/user/user.service';

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
  ) {}

  async toggleBlockStatus(
    initiatorId: string,
    targetId: string,
    toggle: 'add' | 'delete',
  ): Promise<Block[]> {
    const initiatorObjectId = new mongoose.Types.ObjectId(initiatorId);
    const targetObjectId = new mongoose.Types.ObjectId(targetId);
    const existingBlock = await this.blockModel.findOne({
      initiator: initiatorObjectId,
      target: targetObjectId,
    });
    if (initiatorId === targetId)
      throw new InternalServerErrorException(
        'このユーザーは既にブロックされています',
      );
    if (toggle === 'add') {
      if (existingBlock)
        throw new InternalServerErrorException(
          'このユーザーは既にブロックされています',
        );
      await new this.blockModel({
        initiator: initiatorObjectId,
        target: targetObjectId,
      }).save();
    } else if (toggle === 'delete') {
      if (!existingBlock)
        throw new InternalServerErrorException(
          'このユーザーをブロックしていません',
        );
      const { deletedCount } = await this.blockModel.deleteOne({
        initiator: initiatorObjectId,
        target: targetObjectId,
      });
      if (!deletedCount)
        throw new InternalServerErrorException('ブロックの解除に失敗しました');
    } else {
      throw new InternalServerErrorException('toggleが設定されていません。');
    }

    return await this.blockModel
      .find({ initiator: initiatorObjectId })
      .populate({ path: 'target', ...USER_PREVIEW_FIELDS })
      .sort({ createdAt: -1 })
      .exec();
  }

  async fetchUsers(initiatorId: mongoose.Types.ObjectId): Promise<Block[]> {
    return await this.blockModel
      .find({ initiator: initiatorId })
      .populate({ path: 'target', ...USER_PREVIEW_FIELDS })
      .sort({ createdAt: -1 })
      .exec();
  }
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  //FollowModel関数
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // //特定の人のブロックしたユーザーのIDのListを取得
  async getBlockUserIds(id: mongoose.Types.ObjectId): Promise<String[]> {
    const ids = await this.blockModel.distinct('target', { initiator: id });
    return ids.map(target => target.toString());
  }
}
