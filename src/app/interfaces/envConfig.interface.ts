import { LogLevel } from '../types';

export interface EnvConfigReadable {
  getPort(): number
  getTableName(): string
  getLogLevel(): LogLevel
  getAwsRegion(): string
  getSecretId(): string
  getNodeEnv(): string
  isProdEnv(): boolean
  isDevEnv(): boolean
  isTestEnv(): boolean
}
