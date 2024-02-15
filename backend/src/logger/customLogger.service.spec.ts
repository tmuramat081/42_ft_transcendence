import { Logger } from '@nestjs/common';
import { CustomLogger } from './customLogger.service';

describe('CustomLoggerService', () => {
  let customLogger: CustomLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    customLogger = new CustomLogger();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log messages', () => {
    customLogger.log('Test message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Test message'));
  });

  it('should log errors', () => {
    const testError = new Error('Test error');
    customLogger.error(testError);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'));
  });

  it('should log warnings', () => {
    customLogger.warn('Test warning');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Test warning'));
  });

  it('should log debug messages', () => {
    customLogger.debug('Test debug');
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('Test debug'));
  });
});
