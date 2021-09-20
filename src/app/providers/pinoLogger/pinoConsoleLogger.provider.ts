import { injectable, inject } from 'inversify';
import pinoFactory, { Logger } from 'pino';

import {
  EnvConfigReadable,
  Loggable
} from '../../interfaces';
import { TYPES } from '../../constants';

@injectable()
export class PinoConsoleLoggerProvider implements Loggable {
  private readonly pinoLogger: Logger;
  private readonly envConfigProvider: EnvConfigReadable;

  constructor(
    @inject(TYPES.envConfig) envConfigProvider: EnvConfigReadable,
  ) {
    this.envConfigProvider = envConfigProvider;
    this.pinoLogger = pinoFactory({
      level: this.envConfigProvider.getLogLevel(),
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
