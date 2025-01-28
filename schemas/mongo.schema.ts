// schemas/chat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false, timestamps: false })
export class Message {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: false })
  continued: boolean;

  // @Prop({ default: false })
  // continuedBt: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ timestamps: true })
export class ChatRoom extends Document {
  @Prop({ required: true })
  roomName: string;

  @Prop({ required: true, type: [String] })
  users: string[];

  @Prop({ type: [MessageSchema] })
  messages: Message[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

export type MessageDocument = Message & Document;
export type ChatRoomDocument = ChatRoom & Document;
