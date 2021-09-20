import { LogLevel } from '../types';

export interface EnvConfigReadable {
  getPort(): number
  getLogLevel(): LogLevel
  getAwsRegion(): string
  getSecretId(): string
  getNodeEnv(): string
  isProdEnv(): boolean
  isDevEnv(): boolean
  isTestEnv(): boolean
}
