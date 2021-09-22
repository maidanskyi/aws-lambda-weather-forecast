import { inject, injectable } from 'inversify';

import {
  Loggable,
  MetricGettable,
  MetricReadable,
  MetricRegistrable
} from '../../interfaces';
import { TYPES } from '../../constants';
import { HttpException } from '../../exceptions';

/**
 * Weather Metrics Service
 *
 * This service reads metrics from DB and paths them to prometheus
 */
@injectable()
export class WeatherMetricsService implements MetricGettable {
  private readonly metricsStorageService: MetricReadable;
  private readonly loggerService: Loggable;
  private readonly metricsRegistryService: MetricRegistrable;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
    @inject(TYPES.dynamoDbStorage) metricsStorageService: MetricReadable,
    @inject(TYPES.prometheusMetrics) metricsRegistryService: MetricRegistrable,
  ) {
    this.loggerService = loggerService;
    this.metricsStorageService = metricsStorageService;
    this.metricsRegistryService = metricsRegistryService;
  }

  /**
   * Responsible for metric logic
   */
  public async getMetrics(): Promise<[string, string]> {
    this.loggerService.info('Getting metrics from service...');

    let metrics;

    try {
      metrics = await this.metricsStorageService.getMetrics();
    } catch (err) {
      if (err instanceof Error) {
        this.loggerService.error('DbError', err as Record<string, any>);
      }

      throw new HttpException(
        500,
        'Unable to get metrics',
      );
    }

    this.loggerService.debug('Current metrics', metrics);
    this.loggerService.info('Metrics are fetched');

    await this.metricsRegistryService.setMetrics(metrics);

    const [ header, formattedMetrics ] = await this.metricsRegistryService.formatMetrics();

    this.loggerService.info('Metrics are formatted');

    return [header, formattedMetrics];
  }
}
