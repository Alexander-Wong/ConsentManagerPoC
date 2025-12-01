import { ILogger } from "../../types/ILogger";


/**
 * Default console-based logger implementation.
 * 
 * Uses browser/Node.js console methods for output.
 * Useful for development and debugging.
 */
export class ConsoleLogger implements ILogger {
  /**
   * Logs an informational message to console.log.
   */
  log(namespace: string, message: string): void {
    console.log(`[${namespace}] ${message}`);
  }

  /**
   * Logs a warning message to console.warn.
   */
  warn(namespace: string, message: string): void {
    console.warn(`[${namespace}] ${message}`);
  }

  /**
   * Logs an error message to console.error with optional error context.
   */
  error(namespace: string, message: string, error?: unknown): void {
    if (error) {
      console.error(`[${namespace}] ${message}`, error);
    } else {
      console.error(`[${namespace}] ${message}`);
    }
  }
}
