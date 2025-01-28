import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('./cert/dev.mydomain.com+3-key.pem'),
  //   cert: fs.readFileSync('./cert/dev.mydomain.com+3.pem'),
  // };

  //  {
  //     httpsOptions,
  //   }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: '*' });

  await app.listen(3001);
}
bootstrap().catch(console.error);
