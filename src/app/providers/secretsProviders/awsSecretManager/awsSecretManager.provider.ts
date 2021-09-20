import { injectable, inject } from 'inversify';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

import { TYPES } from '../../../constants';
import { HttpException } from '../../../exceptions';
import { SecretReadable, Loggable } from '../../../interfaces';

/**
 * AWS Secrets Manager provider
 *
 * This provider allows us to get secret data
 * that nobody should know
 */
@injectable()
export class AwsSecretManagerProvider implements SecretReadable {
  private readonly loggerService: Loggable;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
  ) {
    this.loggerService = loggerService;
  }

  /**
   * Get secrets form external resource
   */
  public async getSecretsByName(
    secretId: string,
    region: string,
  ): Promise<Record<string, string>> {
    this.loggerService.debug(
      `${this.constructor.name}.getSecretsByName is handling request`,
    );
    this.loggerService.debug('method input parameters', { secretId, region });

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

    try {
      this.loggerService.debug('getting secrets...');

      data = await awsClient.getSecretValue({ SecretId: secretId });

      this.loggerService.debug('secrets successfully received');
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

    if ('SecretString' in data && data.SecretString) {
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

    try {
      this.loggerService.debug('Parsing secrets...');
      this.loggerService.debug(`Secrets - ${stringifiedJSON}`);

      const secrets = JSON.parse(stringifiedJSON);

      this.loggerService.debug('Secrets are parsed');

      return secrets;
    } catch (err: unknown) {
      this.loggerService.error('Error parsing secrets received from AWS');

      throw new HttpException(
        400,
        'Unable to parse secrets received from external resource' +
        'PLs, use key/value pairs in your secrets. Don\'t use plain text',
      );
    }
  }
}
