import { HttpException, Logger, LoggerService } from '@nestjs/common';
import { ErrorLog } from './dto/errorLog.dto';

export class CustomLogger implements LoggerService {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(CustomLogger.name);
  }

  log(message: string): void {
    this.logger.log(`[log] ${message}`);
  }

  error(error: ErrorLog | Error | string) {
    if (error instanceof ErrorLog) {
      this.logger.error(this.format(error));
    } else if (error instanceof Error) {
      this.logger.error(`[Error] ${error.message ?? error.stack}`);
    } else {
      this.logger.error('[Error]', error);
    }
  }

  warn(error: ErrorLog | Error | string): void {
    if (error instanceof ErrorLog) {
      this.logger.warn(this.format(error));
    } else if (error instanceof Error) {
      this.logger.warn(`[Warn] ${error.message ?? error.stack}`);
    } else {
      this.logger.warn(`[Warn] ${error}`);
    }
  }

  debug(error: ErrorLog | Error | string): void {
    if (error instanceof ErrorLog) {
      this.logger.debug(this.format(error));
    } else if (error instanceof Error) {
      this.logger.debug(`[Debug] ${error.message ?? error.stack}`);
    } else {
      this.logger.debug(`[Debug] ${error}`);
    }
  }

  // エラーログの生成
  setErrorLog(exception: unknown, requestMethodAndUrl: string, httpStatus: number): ErrorLog {
    // HttpException以外の場合
    if (!(exception instanceof HttpException)) {
      const error = exception as Error;
      return new ErrorLog({
        statusCode: httpStatus,
        requestUrl: requestMethodAndUrl,
        functionName: exception.constructor.name,
        message: error.message ?? error.stack,
      });
    }
    return new ErrorLog({
      statusCode: httpStatus,
      requestUrl: requestMethodAndUrl,
      functionName: exception.constructor.name,
      message: exception.message,
      stack: exception.stack,
    });
  }

  /** ログ成形 */
  private format(errorLog: ErrorLog): string {
    return `
      LOG_ID     : ${errorLog.logId}
      TIME       : ${errorLog.occurrenceTime}
      ERROR_CODE : ${errorLog.statusCode}
      URL        : ${errorLog.requestUrl}
      METHOD     : ${errorLog.functionName}
      STATUS_CODE: ${errorLog.statusCode}
      MESSAGE    : ${errorLog.message}
      STACK_TRACE: ${errorLog.stack}`;
  }
}
