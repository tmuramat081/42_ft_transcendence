import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { User } from '../users/entities/user.entity';
import { UserSeeder } from './seeders/user.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { GameRoomSeeder } from './seeders/gameRoom.seeder';
import { GameRoom } from '../games/entities/gameRoom.entity';

/*
npm run test

このコマンド cross-env NODE_ENV=development ts-node src/dummy/seeder は、Node.js開発環境で使用されるコマンドで、いくつかの異なるツールと設定が組み合わされています：

cross-env: これは、異なるプラットフォーム（Windows、macOS、Linux）で環境変数を設定する際に、クロスプラットフォーム対応の方法を提供するユーティリティです。通常、環境変数の設定方法はWindowsとUnixベースのシステムで異なります。cross-envはこれを簡素化し、一貫した方法で環境変数を設定することができます。

NODE_ENV=development: これは、アプリケーションが開発環境で実行されていることを示す環境変数です。多くのNode.jsアプリケーションは、開発（development）、テスト（test）、本番（production）など、異なる環境で異なる設定や挙動をします。この場合、developmentが指定されているので、開発用の設定が適用されます。

ts-node: これはTypeScriptを直接実行できるツールです。Node.jsはデフォルトでJavaScriptしか実行できませんが、ts-nodeを使うことで、コンパイルプロセスを省略してTypeScriptファイル（.tsファイル）を直接実行できます。

src/dummy/seeder: これは実行されるTypeScriptファイルのパスです。おそらくこれはデータベースの初期データを設定するためのスクリプトで、seederという名前から、データベースにテストデータやダミーデータを挿入するためのものと推測されます。

要約すると、このコマンドは「開発環境の設定でsrc/dummy/seeder.tsというTypeScriptファイルを直接実行する」という意味です。これにより、開発者は開発環境に特有の設定でデータベースのシーダースクリプトを実行できます。
*/

dotenv.config();
seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      //バリデーション
      //required()は必須項目
      validationSchema: Joi.object({
        POSTGRESS_HOST: Joi.string().required(),
        POSTGRESS_PORT: Joi.number().required(),
        POSTGRESS_USER: Joi.string().required(),
        POSTGRESS_PASSWORD: Joi.string().required(),
        POSTGRESS_DB: Joi.string().required(),
      }),
    }),
    // forRootAsync()を使って非同期接続
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRESS_HOST'),
        port: config.get<number>('POSTGRESS_PORT'),
        username: config.get<string>('POSTGRESS_USER'),
        password: config.get<string>('POSTGRESS_PASSWORD'),
        database: config.get<string>('POSTGRESS_DB'),
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User, GameRoom]),
  ],
}).run([UserSeeder, GameRoomSeeder]);
