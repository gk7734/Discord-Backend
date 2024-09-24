import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Request } from 'express';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  addFriend(@Body('username') username: string, @Req() req: Request) {
    console.log(req.user);
  }
}
