import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUser } from '../decorator/get-user.decorator';
import { User } from 'prisma/prisma-client';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('getRoomList')
  @UseGuards(JwtAuthGuard)
  getRoomList(@GetUser() user: User) {
    return this.chatService.getRoomList(user);
  }

  @Get('getRoomHistory/:roomId')
  @UseGuards(JwtAuthGuard)
  getRoomHistory(@Param('roomId') id: string) {
    return this.chatService.getRoomHistory(id);
  }
}
