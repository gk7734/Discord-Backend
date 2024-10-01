import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: ClientProxy,
  ) {}

  async get(key: string): Promise<string> {
    return await firstValueFrom(this.redisClient.send({ cmd: 'get' }, key));
  }

  async set(key: string, value: string): Promise<void> {
    await firstValueFrom(this.redisClient.send({ cmd: 'set' }, { key, value }));
  }

  async del(key: string): Promise<number> {
    return await firstValueFrom(this.redisClient.send({ cmd: 'del' }, key));
  }

  async exists(key: string): Promise<number> {
    return await firstValueFrom(this.redisClient.send({ cmd: 'exists' }, key));
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await firstValueFrom(
      this.redisClient.send({ cmd: 'expire' }, { key, seconds }),
    );
  }

  async keys(pattern: string): Promise<string[]> {
    return await firstValueFrom(
      this.redisClient.send({ cmd: 'keys' }, pattern),
    );
  }

  async getUserIdBySocket(socketId: string): Promise<string | null> {
    return await firstValueFrom(
      this.redisClient.send({ cmd: 'get' }, `socket:${socketId}`),
    );
  }

  async setUserSocket(userId: string, socketId: string): Promise<void> {
    await firstValueFrom(this.redisClient.send({ cmd: 'multi' }, []));
    await firstValueFrom(
      this.redisClient.send(
        { cmd: 'set' },
        { key: `user:${userId}`, value: socketId },
      ),
    );
    await firstValueFrom(
      this.redisClient.send(
        { cmd: 'set' },
        { key: `socket:${socketId}`, value: userId },
      ),
    );
    await firstValueFrom(this.redisClient.send({ cmd: 'exec' }, []));
  }

  async removeUserSocket(socketId: string): Promise<void> {
    const script = `
    local userId = redis.call('GET', KEYS[1])
    if userId then
      redis.call('DEL', KEYS[1])
      redis.call('DEL', 'user:' .. userId)
    end
    return userId
    `;

    await firstValueFrom(
      this.redisClient.send({ cmd: 'eval' }, [script, 1, `socket:${socketId}`]),
    );
  }
}
