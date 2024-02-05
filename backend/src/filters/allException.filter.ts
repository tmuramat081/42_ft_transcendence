import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { CustomLogger } from '../logger/customLogger.service';

/**
 * カスタム例外フィルター
 * cf. https://docs.nestjs.com/exception-filters
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new CustomLogger();
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * @param exception 捕捉された例外オブジェクト
   * @param host ホスト（現在のリクエストに関する情報）
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus() // 標準のエラークラスはステータスコードを取得
        : HttpStatus.INTERNAL_SERVER_ERROR; // それ以外は500として扱う
    const requestMethodAndUrl = `${httpAdapter.getRequestMethod(request)} ${httpAdapter.getRequestUrl(request)}`;

    const errorLog = this.logger.setErrorLog(exception, requestMethodAndUrl, httpStatus)

    // アプリケーションログを出力 TODO: 本番環境ではエラーIDを生成？
    if (process.env.NODE_ENV === 'development') {
      if (httpStatus >= 500) {
        this.logger.warn(errorLog);
      } else {
        this.logger.error(errorLog);
      }
    }

    // エラーレスポンスを返却
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
