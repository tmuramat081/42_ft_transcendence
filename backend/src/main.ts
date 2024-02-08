import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AllExceptionFilter } from './filters/allException.filter';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Helmetを使用（脆弱性対策）
  app.use(helmet());

  // Swagger設定
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence API')
    .setDescription('API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
