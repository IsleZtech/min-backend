import { MongooseModule } from '@nestjs/mongoose';
import { Delete, DeleteSchema } from 'src/schemas/delete.schema';

import { User, UserSchema } from 'src/schemas/user.schema';
import { MatchService } from './match.service';
import { Module } from '@nestjs/common';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { MatchController } from './match.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
