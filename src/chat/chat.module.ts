import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChatRoom,
  ChatRoomSchema,
} from '../../schemas/mongo.schema';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    RedisCacheModule,
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
