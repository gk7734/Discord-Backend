import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { GetUser } from '../decorator/get-user.decorator';
import { User } from 'prisma/prisma-client';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get('online-list')
  @UseGuards(JwtAuthGuard)
  getOnlineList(@GetUser() user: User) {
    return this.friendService.getOnlineList(user.id);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  addFriend(@Body('username') username: string, @GetUser() user: User) {
    return this.friendService.addFriend(user.id, username);
  }

  @Post('pending/:id')
  @UseGuards(JwtAuthGuard)
  friendPending(
    @Param('id', ParseIntPipe) id: number,
    @Body('accept') accept: boolean,
    @GetUser() user: User,
  ) {
    return this.friendService.friendPending(id, user.id, accept);
  }
}
