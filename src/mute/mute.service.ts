import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import mongoose, { Model } from 'mongoose';
import { Mute, MuteDocument } from 'src/schemas/mute.schema';

@Injectable()
export class MuteService {
  constructor(@InjectModel(Mute.name) private muteModel: Model<MuteDocument>) {}

  async toggleMuteStatus(
    initiatorId: string,
    targetId: string,
    toggle: 'add' | 'delete',
  ): Promise<Mute[]> {
    const userPopulate = { select: '_id user_name profile_image' };
    const initiatorObjectId = new mongoose.Types.ObjectId(initiatorId);
    const targetObjectId = new mongoose.Types.ObjectId(targetId);
    const existingMute = await this.muteModel.findOne({
      initiator: initiatorObjectId,
      target: targetObjectId,
    });
    if (initiatorId === targetId)
      throw new InternalServerErrorException(
        'このユーザーは既に非表示されています',
      );
    if (toggle === 'add') {
      if (existingMute)
        throw new InternalServerErrorException(
          'このユーザーは、すでに非表示しています',
        );
      await new this.muteModel({
        initiator: initiatorObjectId,
        target: targetObjectId,
      }).save();
    } else if (toggle === 'delete') {
      if (!existingMute)
        throw new InternalServerErrorException(
          'このユーザーを非表示していません',
        );
      const { deletedCount } = await this.muteModel.deleteOne({
        initiator: initiatorObjectId,
        target: targetObjectId,
      });
      if (!deletedCount)
        throw new InternalServerErrorException('非表示の解除に失敗しました');
    } else {
      throw new InternalServerErrorException('toggleが設定されていません。');
    }

    return await this.muteModel
      .find({ initiator: initiatorObjectId })
      .populate({ path: 'target', ...userPopulate })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getMuteUsers(initiatorId: string): Promise<Mute[]> {
    const userPopulate = { select: '_id user_name profile_image' };
    const results = await this.muteModel
      .find({ initiator: new mongoose.Types.ObjectId(initiatorId) })
      .populate({ path: 'target', ...userPopulate })
      .sort({ createdAt: -1 })
      .exec();
    return results.filter(mute => mute.target != null);
  }
}
