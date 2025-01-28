import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatRoom,
  ChatRoomDocument,
  Message,
} from '../../schemas/mongo.schema';
import { NotFoundException } from '@nestjs/common';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoomDocument>,
  ) {}

  private userSocketMap = new Map<string, string>();

  handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody('userId') userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`User ${userId} joined with socket ${client.id}`);
    this.userSocketMap.set(userId, client.id);
    client.join(userId);
  }

  @SubscribeMessage('sendDM')
  async handleDirectMessage(
    @MessageBody()
    data: { from: string; to: string; content: string; continued: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(data);
    const { from, to, content, continued } = data;
    const toSocketId = this.userSocketMap.get(to);

    try {
      let chatRoom = await this.chatRoomModel.findOne({
        users: { $all: [from, to] },
        roomName: `DM_${[from, to].sort().join('_')}`,
      });

      if (!chatRoom) {
        chatRoom = await this.chatRoomModel.create({
          roomName: `DM_${[from, to].sort().join('_')}`,
          users: [from, to],
          messages: [],
        });
      }

      const newMessage = {
        senderId: from,
        content: content,
        createdAt: new Date(),
        continued,
      };

      chatRoom.messages.push(newMessage);
      await chatRoom.save();

      const roomHistory = await this.chatRoomModel
        .findOne({ roomName: chatRoom.roomName })
        .select('messages')
        .limit(50);

      client.emit('roomHistory', {
        message: roomHistory?.messages || [],
      });

      if (toSocketId) {
        this.server.to(toSocketId).emit('receiveDM', {
          from,
          content,
          timestamp: newMessage.createdAt,
          continued,
        });
      }
    } catch (err) {
      console.error('Error handling DM:', err);
    }
  }

  @SubscribeMessage('roomJoin')
  async handleRoomJoin(
    @MessageBody() data: { room: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, userId } = data;

    try {
      let chatRoom = await this.chatRoomModel.findOne({ roomName: room });

      if (!chatRoom) {
        chatRoom = await this.chatRoomModel.create({
          roomName: room,
          users: [userId],
          messages: [],
        });
      } else if (!chatRoom.users.includes(userId)) {
        chatRoom.users.push(userId);
        await chatRoom.save();
      }

      client.join(room);
      console.log(`Client ${userId} joined name: ${room}`);

      const roomHistory = await this.chatRoomModel
        .findOne({ roomName: room })
        .select('messages')
        .limit(50);

      client.emit('roomHistory', {
        room,
        message: roomHistory?.messages || [],
      });

      client.to(room).emit('userJoined', { userId, room });
    } catch (err) {
      console.error('Error joining room:', err);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(
    @MessageBody()
    data: { room: string; content: string; userId: string; continued: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, content, userId, continued } = data;

    if (!client.rooms.has(room)) {
      console.log(`Client ${userId} is not in room ${room}`);
      client.emit('error', { message: 'You are not in this room' });
      return;
    }

    try {
      const chatRoom = await this.chatRoomModel.findOne({ roomName: room });
      if (!chatRoom) {
        throw new NotFoundException('Chat room not found');
      }

      const newMessage: Message = {
        senderId: userId,
        content: content,
        createdAt: new Date(),
        continued,
      };

      chatRoom.messages.push(newMessage);
      await chatRoom.save();

      const messageToSend = {
        senderId: userId,
        content: content,
        timestamp: newMessage.createdAt,
      };

      this.server.to(room).emit('newMessage', messageToSend);
      console.log(`Message sent to room ${room}: ${content}`);
    } catch (err) {
      console.error('Failed to save and send message:', err);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('getChatHistory')
  async handleGetChatHistory(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const chatRoom = await this.chatRoomModel
        .findOne({ roomName: data.room })
        .select('messages')
        .limit(50);

      if (chatRoom) {
        client.emit('chatHistory', {
          // room: data.room,
          messages: chatRoom.messages,
        });
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      client.emit('error', { message: 'Failed to fetch chat history' });
    }
  }
}
