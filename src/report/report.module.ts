import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from 'src/schemas/user.schema';
import { Module } from '@nestjs/common';
import { Report, ReportSchema } from 'src/schemas/report.schema';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
