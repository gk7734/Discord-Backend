import { Injectable } from '@nestjs/common';
import { User } from 'prisma/prisma-client';
import { InjectModel } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomDocument } from '../../schemas/mongo.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoomDocument>,
  ) {}

  async getRoomList(user: User) {
    const rooms = await this.chatRoomModel
      .find({
        users: { $in: [user.username] },
      })
      .select('roomName');

    return rooms;
  }

  getRoomHistory(id: string) {
    return this.chatRoomModel.find({ _id: id }).select('messages').limit(50);
  }
}
