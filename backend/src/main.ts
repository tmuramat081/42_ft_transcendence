import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './filters/allException.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // CORSを有効化

  // バリデーションパイプを適用
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 例外フィルターを適用
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));
  // Helmet を使用（脆弱性対策）
  app.use(helmet());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
