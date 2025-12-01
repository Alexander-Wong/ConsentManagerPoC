import { describe, it, expect, vi } from 'vitest';
import { NoOpLogger } from '../../../src/utils/logging/NoOpLogger.js';

describe('NoOpLogger', () => {
  it('should not call console.log when log is called', () => {
    const spy = vi.spyOn(console, 'log');
    const logger = new NoOpLogger();

    logger.log('Test', 'Message');

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should not call console.warn when warn is called', () => {
    const spy = vi.spyOn(console, 'warn');
    const logger = new NoOpLogger();

    logger.warn('Test', 'Message');

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should not call console.error when error is called', () => {
    const spy = vi.spyOn(console, 'error');
    const logger = new NoOpLogger();

    logger.error('Test', 'Message', new Error());

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should implement ILogger interface', () => {
    const logger = new NoOpLogger();
    expect(logger).toHaveProperty('log');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('error');
  });
});
