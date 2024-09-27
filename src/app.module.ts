import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { CaptchaModule } from './captcha/captcha.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';

@Module({
  imports: [AuthModule, ChatModule, FriendModule, CaptchaModule, RedisCacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
