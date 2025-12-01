/**
 * Logger interface for flexible logging implementation.
 * 
 * Allows different logging strategies (console, file, monitoring services, etc.)
 * to be plugged in without modifying service code.
 */
export interface ILogger {
  /**
   * Log an informational message.
   * 
   * @param namespace - The source namespace/module name
   * @param message - The message to log
   */
  log(namespace: string, message: string): void;

  /**
   * Log a warning message.
   * 
   * @param namespace - The source namespace/module name
   * @param message - The message to log
   */
  warn(namespace: string, message: string): void;

  /**
   * Log an error message.
   * 
   * @param namespace - The source namespace/module name
   * @param message - The message to log
   * @param error - Optional error object for additional context
   */
  error(namespace: string, message: string, error?: unknown): void;
}
