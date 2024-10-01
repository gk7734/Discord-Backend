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
import { RedisCacheService } from '../redis-cache/redis-cache.service';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisCacheService) {}

  handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);

    const users = await this.redisService.keys('user:*');
    for (const userKey of users) {
      const socketId = await this.redisService.get(userKey);

    }
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
  handleDirectMessage(
    @MessageBody() data: { from: string; to: string; content: string },
  ) {
    console.log(data);
    const { from, to, content } = data;
    const toSocketId = this.userSocketMap.get(to);

    if (toSocketId) {
      this.server.to(toSocketId).emit('receiveDM', { from, content });
    } else {
      console.log(`User ${to} not found or not connected`);
    }
  }

  @SubscribeMessage('roomJoin')
  handleRoomJoin(
    @MessageBody('room') room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    console.log(`Client ${client.id} joined room: ${room}`);
    // 새 사용자가 참여했음을 방의 다른 사용자들에게 알림
    client.to(room).emit('userJoined', { userId: client.id, room });
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(
    @MessageBody() data: { room: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, content } = data;

    if (!client.rooms.has(room)) {
      console.log(`Client ${client.id} is not in room ${room}`);
      client.emit('error', { message: 'You are not in this room' });
      return;
    }

    const message = {
      sender: client.id,
      content,
      timestamp: new Date().toISOString(),
    };

    try {
      client.to(room).emit('newMessage', message);
      console.log(`Message sent to room ${room}: ${content}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }
}
