import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleLogger } from '../../../src/utils/logging/ConsoleLogger.js';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    logger = new ConsoleLogger();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log', () => {
    it('should call console.log with formatted message', () => {
      logger.log('TestService', 'Test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('[TestService] Test message');
    });

    it('should handle empty namespace', () => {
      logger.log('', 'Message');
      expect(consoleLogSpy).toHaveBeenCalledWith('[] Message');
    });
  });

  describe('warn', () => {
    it('should call console.warn with formatted message', () => {
      logger.warn('TestService', 'Warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[TestService] Warning message');
    });

    it('should handle special characters in message', () => {
      logger.warn('Test', 'Warning: $#@!');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Test] Warning: $#@!');
    });
  });

  describe('error', () => {
    it('should call console.error with formatted message when no error object', () => {
      logger.error('TestService', 'Error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestService] Error message');
    });

    it('should call console.error with message and error object', () => {
      const error = new Error('Test error');
      logger.error('TestService', 'Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TestService] Error occurred',
        error
      );
    });

    it('should handle non-Error objects', () => {
      logger.error('Test', 'Error', { code: 500 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Test] Error',
        { code: 500 }
      );
    });
  });

  describe('integration', () => {
    it('should support multiple consecutive calls', () => {
      logger.log('Service', 'Log 1');
      logger.warn('Service', 'Warn 1');
      logger.error('Service', 'Error 1');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
