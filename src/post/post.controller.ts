import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostsDto } from './dto/post-create.dto';
import { PostUpdateDto } from './dto/post-update.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create/:id')
  async createPost(
    @Param('id') Id: string,
    @Body() createPostDto: CreatePostsDto,
  ) {
    return await this.postService.createPost(createPostDto, Id);
  }

  @Post('like/:postId/:id')
  async toggleLike(
    @Param('postId') PostId: string,
    @Param('id') Id: string,
    @Query('toggle') toggle: 'add' | 'delete',
  ) {
    const file = 'like_list';
    return await this.postService.toggleListItem(PostId, Id, file, toggle);
  }
  @Post('view/:postId/:id')
  async toggleView(@Param('postId') PostId: string, @Param('id') Id: string) {
    const file = 'view_list';
    return await this.postService.toggleListItem(PostId, Id, file, 'add');
  }

  @Get('user/:targetId')
  async getPosts(
    @Param('targetId') targetId: string,
    @Query('initiator_id') initiatorId: string,
  ) {
    return await this.postService.getPosts(targetId, initiatorId);
  }

  @Post('activities/users')
  async getPostsActivitiesById(@Body() ids: string[]) {
    return await this.postService.getPostsActivitiesByIds(ids);
  }
  @Post('update/:id')
  async updatePost(
    @Param('id') postId: string,
    @Body() postUpdateDto: PostUpdateDto,
  ) {
    return await this.postService.updatePost(postId, postUpdateDto);
  }

  @Delete('delete/:id')
  async deletePost(@Param('id') postId: string) {
    return await this.postService.deletePost(postId);
  }
}
