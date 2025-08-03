import { MongooseModule } from '@nestjs/mongoose';
import { Delete, DeleteSchema } from 'src/schemas/delete.schema';

import { User, UserSchema } from 'src/schemas/user.schema';
import { DeleteController } from './delete.controller';
import { DeleteService } from './delete.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Delete.name, schema: DeleteSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [DeleteController],
  providers: [DeleteService],
})
export class DeleteModule {}
