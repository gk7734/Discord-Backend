import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;

  handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    console.log(userId);
    client.join(userId);
  }

  @SubscribeMessage('sendDM')
  handleDirectMessage(
    @MessageBody() data: { to: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(data);
    const { to, content } = data;
    this.server.to(to).emit('receiveDM', { from: client.id, content });
  }
}
