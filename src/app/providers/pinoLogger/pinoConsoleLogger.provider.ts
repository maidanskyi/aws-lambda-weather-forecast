import { injectable } from 'inversify';
import pinoFactory, { Logger } from 'pino';
import { Loggable } from '../../interfaces';

@injectable()
export class PinoConsoleLoggerProvider implements Loggable {
  private readonly pinoLogger: Logger;

  constructor() {
    this.pinoLogger = pinoFactory({
      level: process.env['LOG_LEVEL'] || 'info',
    });
  }

  /**
   * Error logger
   */
  public error<T extends Record<string, unknown>>(msg: string, obj?: T): void {
    this.pinoLogger.error(obj || {}, msg);
  }

  /**
   * Warning logger
   */
  public warn<T extends Record<string, unknown>>(msg: string, obj?: T): void {
    this.pinoLogger.warn(obj || {}, msg);
  }

  /**
   * Info logger
   */
  public info<T extends Record<string, unknown>>(msg: string, obj?: T): void {
    this.pinoLogger.info(obj || {}, msg);
  }

  /**
   * Debug logger
   */
  public debug<T extends Record<string, unknown>>(msg: string, obj?: T): void {
    this.pinoLogger.debug(obj || {}, msg);
  }

}
