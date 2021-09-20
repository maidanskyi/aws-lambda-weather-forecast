import { injectable } from 'inversify';
import { EnvConfigReadable } from '../../../interfaces';
import { HttpException } from '../../../exceptions';
import { LogLevel } from '../../../types';

/**
 * Environment Config Provider
 *
 * This provider allows us to get access to ENV variables
 */
@injectable()
export class EnvConfigurationProvider implements EnvConfigReadable {

  /**
   * Returns AWS region
   */
  public getAwsRegion(): string {
    const region = process.env['AWS_REGION'];

    if (!region) {
      throw new HttpException(
        500,
        'AWS_REGION env variable is required',
      );
    }

    return region;
  }

  /**
   * Returns valid log level
   */
  public getLogLevel(): LogLevel {
    let logLevel = process.env['LOG_LEVEL'];
    const validLogLevels = new Set(['error', 'warn', 'info', 'debug']);

    if (!logLevel || !validLogLevels.has(logLevel)) {
      logLevel = 'info';
    }

    return logLevel as LogLevel;
  }

  /**
   * Returns NODE_ENV
   */
  public getNodeEnv(): string {
    let nodeEnv = process.env['LOG_LEVEL'];
    const validEnvs = new Set(['production', 'dev', 'test']);

    if (!nodeEnv || !validEnvs.has(nodeEnv)) {
      nodeEnv = 'production';
    }

    return nodeEnv;
  }

  /**
   * Returns port where the app should be run
   */
  public getPort(): number {
    const port = parseInt(String(process.env['PORT']), 10);

    if (isNaN(port)) {
      return 3000;
    }

    return port;
  }

  /**
   * Returns AWS SecretID needed for AWS Secrets Manager
   */
  public getSecretId(): string {
    const secretId = process.env['SECRET_ID'];

    if (!secretId) {
      throw new HttpException(
        500,
        'SECRET_ID env variable is required',
      );
    }

    return secretId;
  }

  /**
   * Checks whether NODE_env is dev
   */
  public isDevEnv(): boolean {
    return this.getNodeEnv() === 'dev';
  }

  /**
   * Checks whether NODE_env is production
   */
  public isProdEnv(): boolean {
    return this.getNodeEnv() === 'production';
  }

  /**
   * Checks whether NODE_env is test
   */
  public isTestEnv(): boolean {
    return this.getNodeEnv() === 'test';
  }

}
