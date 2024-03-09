import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionFilter } from './allException.filter';
import { AbstractHttpAdapter, HttpAdapterHost } from '@nestjs/core';

describe('AllExceptionFilter', () => {
  let filter: AllExceptionFilter;
  let mockHttpAdapterHost: HttpAdapterHost;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    // httpAdapterHostをモック化
    const mockHttpAdapter = {
      getRequestUrl: jest.fn().mockReturnValue('mock-url'),
      getRequestMethod: jest.fn().mockReturnValue('GET'),
      reply: jest.fn(),
    } as unknown as AbstractHttpAdapter;
    mockHttpAdapterHost = { httpAdapter: mockHttpAdapter } as HttpAdapterHost;

    // 例外フィルターのインスタンスを作成
    filter = new AllExceptionFilter(mockHttpAdapterHost);

    // argumentsHostをモック化
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({}),
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle HTTP exception correctly', () => {
    const mockHttpException = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(mockHttpException, mockArgumentsHost as unknown as ArgumentsHost);

    expect(mockHttpAdapterHost.httpAdapter.getRequestUrl).toHaveBeenCalled();
    expect(mockHttpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should handle 404 NOT FOUND exception correctly', () => {
    const mockNotFoundException = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(mockNotFoundException, mockArgumentsHost as unknown as ArgumentsHost);

    expect(mockHttpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
      }),
      HttpStatus.NOT_FOUND,
    );
  });

  it('should handle non-HTTP exception correctly', () => {
    const mockNonHttpException = new Error('Non-HTTP error');

    filter.catch(mockNonHttpException, mockArgumentsHost as unknown as ArgumentsHost);

    expect(mockHttpAdapterHost.httpAdapter.getRequestUrl).toHaveBeenCalled();
    expect(mockHttpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
