import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AllExceptionFilter } from './filters/allException.filter';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORSを有効化
  app.enableCors({
    //origin: true,
    origin: [process.env.FRONTEND_URL],
    //origin: "http://localhost:3000",
    //methods: "GET,POST,PUT,DELETE,OPTIONS",
    //methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    //allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  });

  // cookieを有効化
  app.use(cookieParser());

  // transformオプションをtrueにすると、受け取ったデータを型に変換してくれる
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 例外フィルターを適用
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));

  // Helmetを使用（脆弱性対策）
  //https://stackoverflow.com/questions/69243166/err-blocked-by-response-notsameorigin-cors-policy-javascript
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

  // 静的ファイルを提供
  const staticAssetsPath = join(process.cwd(), process.env.AVATAR_IMAGE_DIR);
  console.log("staticAssetsPath: ", staticAssetsPath)
  app.useStaticAssets(staticAssetsPath, {
    prefix: "/api/uploads/",
  });

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

void bootstrap();
