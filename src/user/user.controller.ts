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
} from '@nestjs/common';
import { UsersService } from './user.service';
import { ObjectId } from 'mongoose';
import { UserLoginDto } from './dto/user-login.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { FindUsersByPhoneDto } from './dto/user-phone.dto';
import { SearchUserDto } from './dto/users-search.dto';
import { FindFriendsByPhoneDto } from './dto/user-friendsbyphones.dto';
import { FindFriendsIdsDto } from './dto/user-friendsbyids.dto';
import { DeleteCreateDto } from 'src/delete/dto/create.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/find/:targetId')
  @UsePipes(ValidationPipe)
  findById(
    @Param('targetId') targetId: string,
    @Query('initiator_id') initiatorId: string,
  ) {
    return this.userService.findById(targetId, initiatorId);
  }

  @Get('/find/pincode/:targetPincode')
  @UsePipes(ValidationPipe)
  findByPinCode(
    @Param('targetPincode') targetPinCode: string,
    @Query('initiator_id') initiatorId: string,
  ) {
    return this.userService.findByPinCode(targetPinCode, initiatorId);
  }

  @Post('/find/phones')
  @UsePipes(ValidationPipe)
  friendsByPhones(@Body() friendsByPhonesDto: FindFriendsByPhoneDto) {
    return this.userService.friendsByPhones(friendsByPhonesDto);
  }

  @Post('/find/ids')
  @UsePipes(ValidationPipe)
  friendsByIds(@Body() friendsByIds: string[]) {
    return this.userService.friendsByIds(friendsByIds);
  }

  @Get('/search')
  @UsePipes(ValidationPipe)
  searchUser(@Query('keyword') keyword: string) {
    return this.userService.searchUser(keyword);
  }

  @Post('/:id/startup')
  @UsePipes(ValidationPipe)
  startupData(
    @Param('id') id: string,
    @Body() userStartupDto: { fcm_token: string; language: string },
  ) {
    return this.userService.startupData(
      id,
      userStartupDto.fcm_token,
      userStartupDto.language,
    );
  }

  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  updateUser(@Param('id') id: string, @Body() userUpdateDto: UserUpdateDto) {
    return this.userService.updateUser(id, userUpdateDto);
  }

  @Post('/phone/authenticate') //電話番号はサインアップとログイン同じAPIで行う
  @UsePipes(ValidationPipe)
  phoneAuthenticate(@Body() userCreateDto: UserCreateDto) {
    return this.userService.phoneAuthenticate(userCreateDto);
  }

  @Post('/logout/:id')
  @UsePipes(ValidationPipe)
  logoutUser(@Param('id') id: string) {
    return this.userService.logoutUser(id);
  }

  @Get('/refetch/:id')
  @UsePipes(ValidationPipe)
  refetch(@Param('id') id: string) {
    return this.userService.refetch(id);
  }

  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  deleteAccount(
    @Param('id') id: string,
    @Body() daleteCreateDto: DeleteCreateDto,
  ) {
    return this.userService.deleteAccount(id, daleteCreateDto);
  }
}
