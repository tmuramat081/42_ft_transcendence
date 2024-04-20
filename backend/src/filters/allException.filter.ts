import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { CustomLogger } from '../logger/customLogger.service';

type HttpExceptionResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

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

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR as number; // デフォルトのステータスコード
    let message = 'Internal Server Error'; // デフォルトのエラーメッセージ

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus(); // 標準のエラークラスはステータスコードを取得
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        // オブジェクトのみで構成される場合
        const errorMessage = (response as HttpExceptionResponse).message || exception.message;
        message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      } else if (typeof response === 'string') {
        // メッセージのみで構成される場合
        message = response;
      }
    }
    const requestMethodAndUrl = `${httpAdapter.getRequestMethod(
      request,
    )} ${httpAdapter.getRequestUrl(request)}`;

    const errorLog = this.logger.setErrorLog(exception, requestMethodAndUrl, httpStatus);

    // アプリケーションログを出力 TODO: 本番環境ではエラーIDを生成？
    if (process.env.NODE_ENV === 'development') {
      if (httpStatus >= 500) {
        this.logger.warn(errorLog);
      } else {
        this.logger.error(errorLog);
      }
    } else {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      path: httpAdapter.getRequestUrl(request),
      message: message,
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
