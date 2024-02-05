import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AllExceptionFilter } from './filters/allException.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORSを有効化
  app.enableCors(
    {
      origin: true,
      //methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    }
  ); 

  // cookieを有効化
  app.use(cookieParser())

  // transformオプションをtrueにすると、受け取ったデータを型に変換してくれる
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 例外フィルターを適用
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));
  // Helmet を使用（脆弱性対策）
  app.use(helmet());
  
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
