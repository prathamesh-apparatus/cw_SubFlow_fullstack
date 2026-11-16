import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  // FRONTEND_URL may be a comma-separated list. Localhost 3000 AND 3001 are always
  // allowed: `next dev` picks 3001 automatically when 3000 is busy, and a CORS
  // mismatch surfaces in the browser as a generic "Failed to fetch" on login.
  const corsOrigins = new Set<string>([
    ...(process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map((o) => o.trim()).filter(Boolean),
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ]);
  app.enableCors({ origin: [...corsOrigins], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  const port = parseInt(process.env.BACKEND_PORT || '4000', 10);
  await app.listen(port);
  console.log(`SubFlow backend running on port ${port}`);
}
bootstrap();
