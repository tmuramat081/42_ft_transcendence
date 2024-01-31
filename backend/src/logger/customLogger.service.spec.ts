import { Logger } from '@nestjs/common';
import { CustomLogger } from './customLogger.service';

describe('CustomLoggerService', () => {
  let customLogger: CustomLogger;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    customLogger = new CustomLogger();
    loggerSpy = jest.spyOn(Logger.prototype, 'log');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log messages', () => {
    customLogger.log('Test message');
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Test message'));
  });

  it('should log errors', () => {
    const testError = new Error('Test error');
    customLogger.error(testError);
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'));
  });

  it('should log warnings', () => {
    customLogger.warn('Test warning');
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Test warning'));
  });

  it('should log debug messages', () => {
    customLogger.debug('Test debug');
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Test debug'));
  });
});
