import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { randomUUID } from 'crypto';

// Hack para que randomUUID esté disponible como crypto.randomUUID
if (!(global as any).crypto) {
  (global as any).crypto = {
    randomUUID,
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // 
    credentials: true, 
  });

  await app.listen(3000);
}
bootstrap();