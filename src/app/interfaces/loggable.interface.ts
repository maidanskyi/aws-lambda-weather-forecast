/* eslint-disable no-unused-vars */

interface LogFn {
  <T extends Record<string, unknown>>(msg: string, obj?: T): void;
}

export interface Loggable {
  error: LogFn
  warn: LogFn
  info: LogFn
  debug: LogFn
}
