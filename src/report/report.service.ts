import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import mongoose, { Model } from 'mongoose';
import { Report, ReportDocument } from 'src/schemas/report.schema';
import { User, UsersDocument } from 'src/schemas/user.schema';
import { ReportCreateDto } from './dto/create.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(createDto: ReportCreateDto): Promise<ReportDocument> {
    try {
      const initiatorId = new mongoose.Types.ObjectId(createDto.initiator_user);
      const targetUserId = new mongoose.Types.ObjectId(createDto.target_user);
      const existingReport = await this.reportModel.findOne({
        initiator_user: initiatorId,
        target_user: targetUserId,
      });

      if (existingReport && !createDto.message) {
        existingReport.reason_code = Number(createDto.reason_code);
        existingReport.reason = createDto.reason;
        return existingReport.save();
      } else {
        const newData = new this.reportModel({
          ...createDto,
          target_user: targetUserId,
          ...(createDto.message && { message: createDto.message }),
          initiator_user: initiatorId,
          reason_code: Number(createDto.reason_code),
        });
        return newData.save();
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `処理中に何らかのエラー：${error}`,
      );
    }
  }
}
