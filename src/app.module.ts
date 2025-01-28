import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { CaptchaModule } from './captcha/captcha.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    FriendModule,
    CaptchaModule,
    RedisCacheModule,
    MongooseModule.forRoot('mongodb://localhost:27017/discord'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
