import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * カスタム例外フィルター
 * cf. https://docs.nestjs.com/exception-filters
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * @param exception 捕捉された例外オブジェクト
   * @param host ホスト（現在のリクエストに関する情報）
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    // 開発環境ではアプリケーションログを出力 TODO: 本番環境ではエラーIDを生成？
    if (process.env.NODE_ENV === 'development') {
      console.error(exception);
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus() // 標準のエラークラスである場合はステータスコードを取得
        : HttpStatus.INTERNAL_SERVER_ERROR; // それ以外は500として扱う

    // エラーレスポンスを返却
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

// TODO: 以下はエラー設計が決まったら実装
// class ErrorResponse {
//   /** ステータスコード */
//   statusCode: number;
//   /** タイムスタンプ */
//   occurrenceTime: string;
//   /** ログID */
// }
