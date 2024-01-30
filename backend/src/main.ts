import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './filters/allException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // CORSを有効化

  // バリデーションパイプを適用
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 例外フィルターを適用
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));

  await app.listen(3000);
}
bootstrap();
