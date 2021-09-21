import {
  inject,
  injectable
} from 'inversify';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

import {
  Loggable,
  EnvConfigReadable,
  MetricPublishable,
  MetricReadable
} from '../../../interfaces';
import { TYPES } from '../../../constants';
import { Metrics } from '../../../types';
import { HttpException } from '../../../exceptions';

/**
 * AWS DynamoDB Provider
 *
 * This class stores and fetches metrics data
 */
@injectable()
export class DynamoDbProvider implements MetricPublishable, MetricReadable {
  private readonly loggerService: Loggable;
  private readonly envConfigService: EnvConfigReadable;
  private readonly dbService: DynamoDB;

  // tricky solution but for test purposes it will be ok
  private readonly documentIdField = 'uniqDocumentId';
  private readonly successField = 'successResponses';
  private readonly failureField = 'failureResponses';

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
    @inject(TYPES.envConfig) envConfigService: EnvConfigReadable,
  ) {
    this.loggerService = loggerService;
    this.envConfigService = envConfigService;
    this.dbService = new DynamoDB({
      region: this.envConfigService.getAwsRegion(),
    });
  }

  /**
   * Retrieves metrics from the storage
   */
  public async getMetrics(): Promise<Metrics> {
    this.loggerService.info('Retrieving metrics...');

    let response;
    const params = {
      TableName: this.envConfigService.getTableName(),
      Key: {
        id: { S: this.documentIdField },
      },
      ProjectionExpression: `${this.successField}, ${this.failureField}`,
    };

    try {
      response = await this.dbService.getItem(params);
    } catch (err) {
      const errorMessage = 'Unable to get metrics from the storage';

      if (err instanceof Object)
        this.loggerService.error(errorMessage, err as Record<string, any>);
      else {
        this.loggerService.debug(`type of unexpected error is ${typeof err}`);
        this.loggerService.error(errorMessage);
      }

      throw new HttpException(500, errorMessage);
    }

    this.loggerService.debug('response:', response as Record<string, any>);
    this.loggerService.info('Metrics successfully retrieved');

    return {
      successResponses: Number(response.Item?.[this.successField]?.['N'] ?? 0),
      failureResponses: Number(response.Item?.[this.failureField]?.['N'] ?? 0),
    };
  }

  /**
   * Updates (autoincrements) failure metric in the storage
   */
  public async updateFailureMetric(): Promise<void> {
    this.loggerService.info('Updating failure metrics...');

    const params = {
      TableName: this.envConfigService.getTableName(),
      Key: {
        id: { S: this.documentIdField },
      },
      UpdateExpression: `ADD ${this.failureField} :inc`,
      ExpressionAttributeValues: {
        ':inc': {
          N: '1',
        },
      },
    };

    try {
      await this.dbService.updateItem(params);
    } catch (err) {
      const errorMessage = 'Unable to update failure metrics';

      if (err instanceof Object)
        this.loggerService.error(errorMessage, err as Record<string, any>);
      else {
        this.loggerService.debug(`type of unexpected error is ${typeof err}`);
        this.loggerService.error(errorMessage);
      }
    }

    this.loggerService.info('Failure metrics successfully updated');
  }

  /**
   * Updates (autoincrements) success metric in the storage
   */
  public async updateSuccessMetric(): Promise<void> {
    this.loggerService.info('Updating success metrics...');

    const params = {
      TableName: this.envConfigService.getTableName(),
      Key: {
        id: { S: this.documentIdField },
      },
      UpdateExpression: `ADD ${this.successField} :inc`,
      ExpressionAttributeValues: {
        ':inc': {
          N: '1',
        },
      },
    };

    try {
      await this.dbService.updateItem(params);
    } catch (err) {
      const errorMessage = 'Unable to update success metrics';

      if (err instanceof Object)
        this.loggerService.error(errorMessage, err as Record<string, any>);
      else {
        this.loggerService.debug(`type of unexpected error is ${typeof err}`);
        this.loggerService.error(errorMessage);
      }
    }

    this.loggerService.info('Success metrics successfully updated');
  }

}
