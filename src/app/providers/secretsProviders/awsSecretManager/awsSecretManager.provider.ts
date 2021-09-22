import { injectable, inject } from 'inversify';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

import { TYPES } from '../../../constants';
import { HttpException } from '../../../exceptions';
import {
  SecretReadable,
  Loggable,
  EnvConfigReadable
} from '../../../interfaces';

/**
 * AWS Secrets Manager provider
 *
 * This provider allows us to get secret data
 * that nobody should know
 */
@injectable()
export class AwsSecretManagerProvider implements SecretReadable {
  private readonly loggerService: Loggable;
  private readonly envConfigService: EnvConfigReadable;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
    @inject(TYPES.envConfig) envConfigService: EnvConfigReadable,
  ) {
    this.loggerService = loggerService;
    this.envConfigService = envConfigService;
  }

  /**
   * Get secrets form external resource
   */
  public async getSecretsByName(): Promise<Record<string, string>> {
    this.loggerService.debug(
      `${this.constructor.name}.getSecretsByName is handling request`,
    );

    if (!this.envConfigService.isProdEnv()) {
      this.loggerService.debug('Getting secrets in DEV mode...');

      const secrets = this.envConfigService.getWeatherSecrets();

      return this.parseStringifiedSecrets(secrets);
    }

    const secretId = this.envConfigService.getSecretId();
    const region = this.envConfigService.getAwsRegion();

    this.loggerService.debug('parameters', { secretId, region });

    const stringifiedSecrets = await this.fetchSecrets(secretId, region);
    const parsedSecrets = this.parseStringifiedSecrets(stringifiedSecrets);

    this.loggerService.debug(
      `${this.constructor.name}.getSecretsByName successfully returns value`,
    );

    return parsedSecrets;
  }

  /**
   * Retrieves secrets from external resource
   */
  private async fetchSecrets(
    secretId: string,
    region: string,
  ): Promise<string> {
    this.loggerService.debug(
      `${this.constructor.name}.fetchSecrets is handling request`,
    );
    this.loggerService.debug(
      'fetchSecrets method input parameters',
      { secretId, region },
    );
    this.loggerService.debug('creating AWS SecretsManager client...');

    const awsClient = new SecretsManager({ region });

    this.loggerService.debug('AWS SecretsManager client created');

    let data;
    let secrets: string;

    this.loggerService.debug('getting secrets...');

    try {
      data = await awsClient.getSecretValue({ SecretId: secretId });
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.loggerService.error(
          'Received an error fetching secrets',
          {
            name: err.name,
            message: err.message,
            stack: err.stack,
          },
        );

        throw new HttpException(400, err.message);
      }

      const errMessage = 'Received an error fetching secrets from ' +
        'external resource';

      if (err instanceof Object)
        this.loggerService.error(errMessage, err as Record<string, any>);
      else {
        this.loggerService.debug(`type of unexpected error is ${typeof err}`);
        this.loggerService.error(errMessage);
      }

      throw new HttpException(
        500,
        'Unknown Error: fetching secrets from external resource',
      );
    }

    this.loggerService.debug('secrets successfully received');

    if ('SecretString' in data && data.SecretString) {
      this.loggerService.debug('SecretString is in secrets');

      secrets = data.SecretString;
    } else
      throw new HttpException(
        400,
        `Secrets should be saved as key/value. Don't use binary format`,
      );

    return secrets;
  }

  /**
   * Parses stringified JSON
   */
  private parseStringifiedSecrets(
    stringifiedJSON: string,
  ): Record<string, string> {
    this.loggerService.debug(
      `${this.constructor.name}.parseStringifiedSecrets is handling request`,
    );
    this.loggerService.debug(
      'parseStringifiedSecrets method input parameters',
      { stringifiedJSON },
    );

    this.loggerService.debug('Parsing secrets...');
    this.loggerService.debug(`Secrets - ${stringifiedJSON}`);

    let secrets;

    try {
      secrets = JSON.parse(stringifiedJSON);
    } catch (err: unknown) {
      this.loggerService.error('Error parsing secrets received from AWS');

      throw new HttpException(
        400,
        'Unable to parse secrets received from external resource' +
        'PLs, use key/value pairs in your secrets. Don\'t use plain text',
      );
    }

    this.loggerService.debug('Secrets are parsed');

    return secrets;
  }
}
