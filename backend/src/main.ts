import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  
  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
