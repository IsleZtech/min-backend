import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mute, MuteSchema } from 'src/schemas/mute.schema';

import { User, UserSchema } from 'src/schemas/user.schema';
import { MuteController } from './mete.controller';
import { MuteService } from './mute.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mute.name, schema: MuteSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [MuteController],
  providers: [MuteService],
  exports: [MuteService],
})
export class MuteModule {}
