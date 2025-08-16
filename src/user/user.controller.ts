import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  ValidationPipe,
  Param,
  Patch,
  Put,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { Point, User, UsersDocument } from 'src/schemas/user.schema';
import { UserCreateDto } from './dto/user-create.dto';
import { DeleteCreateDto } from 'src/delete/dto/create.dto';
import { Model } from 'mongoose';
import { sendPushNotification } from 'src/Notification/notification';
import { InjectModel } from '@nestjs/mongoose/dist';

@Controller('user')
export class UsersController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UsersDocument>,
    private readonly userService: UsersService,
  ) {}

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // 取得系
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  @Post('startup/:id')
  @UsePipes(ValidationPipe)
  startupData(
    @Param('id') id: string,
    @Body()
    userStartupDto: {
      fcm_token: string;
      language: string;
      location: Point;
      max_distance: number;
    },
  ) {
    return this.userService.startupData(
      id,
      userStartupDto.fcm_token,
      userStartupDto.language,
      userStartupDto.location,
      userStartupDto.max_distance,
    );
  }

  @Post('/fetch/swipe/:id')
  @UsePipes(ValidationPipe)
  swipeUsers(
    @Param('id') id: string,
    @Body() body: { location: Point; max_distance: number },
  ) {
    return this.userService.swipeUsers(id, body.location, body.max_distance);
  }
  @Post('/fetch/:id')
  @UsePipes(ValidationPipe)
  fetchUser(@Param('id') id: string) {
    return this.userService.fetchUser(id);
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // 更新系
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  updateUser(@Param('id') id: string, @Body() userUpdateDto: UserUpdateDto) {
    return this.userService.updateUser(id, userUpdateDto);
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // サインアップ / ログアウト/削除
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  @Post('/signup/phone') //電話番号はサインアップとログイン同じAPIで行う
  @UsePipes(ValidationPipe)
  phoneAuthenticate(@Body() userCreateDto: UserCreateDto) {
    return this.userService.phoneAuthenticate(userCreateDto);
  }

  @Post('/logout/:id')
  @UsePipes(ValidationPipe)
  logoutUser(@Param('id') id: string) {
    return this.userService.logoutUser(id);
  }

  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  deleteAccount(
    @Param('id') id: string,
    @Body() daleteCreateDto: DeleteCreateDto,
  ) {
    return this.userService.deleteAccount(id, daleteCreateDto);
  }

  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//
  // 通知を送る
  //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊//

  @Post('/notify/call/')
  @HttpCode(204)
  async sendNotification(
    @Body()
    dto: {
      target_user: string;
      send_user: string;
    },
  ) {
    await sendPushNotification(
      this.userModel,
      'call',
      dto.target_user,
      dto.send_user,
    );
  }
}
