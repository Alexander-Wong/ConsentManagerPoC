import { ILogger } from "../../types/ILogger.js";

/**
 * No-operation logger implementation.
 * 
 * Discards all log messages silently.
 * Useful for production environments where logging should be disabled,
 * or for testing scenarios where logs would pollute output.
 */
export class NoOpLogger implements ILogger {
  /**
   * Does nothing - silently discards the message.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(_namespace: string, _message: string): void {
    // Intentionally empty - no-op logger
  }

  /**
   * Does nothing - silently discards the message.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(_namespace: string, _message: string): void {
    // Intentionally empty - no-op logger
  }

  /**
   * Does nothing - silently discards the message and error.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(_namespace: string, _message: string, _error?: unknown): void {
    // Intentionally empty - no-op logger
  }
}
