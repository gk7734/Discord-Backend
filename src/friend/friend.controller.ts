import {
  Body,
  Controller, Param,
  ParseBoolPipe, ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Request } from 'express';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  addFriend(@Body('username') username: string, @Req() req: Request) {
    const parseJSON = JSON.parse(JSON.stringify(req.user));
    return this.friendService.addFriend(parseJSON.id, username);
  }

  @Post('pending/:id')
  @UseGuards(JwtAuthGuard)
  friendPending(
    @Param('id', ParseIntPipe) id: number,
    @Body('accept') accept: boolean,
    @Req() req: Request,
  ) {
    const parseJSON = JSON.parse(JSON.stringify(req.user));
    return this.friendService.friendPending(id, parseJSON.id, accept);
  }
}
