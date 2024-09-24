import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./cert/dev.mydomain.com+3-key.pem'),
    cert: fs.readFileSync('./cert/dev.mydomain.com+3.pem'),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });
  app.enableCors({ origin: 'https://test.mydomain.com' });

  await app.listen(3000);
}
bootstrap().catch(console.error);
