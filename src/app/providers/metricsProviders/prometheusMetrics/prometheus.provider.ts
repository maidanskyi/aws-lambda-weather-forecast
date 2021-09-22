import { inject, injectable } from 'inversify';
import { Counter, Registry } from 'prom-client';

import {
  Loggable,
  MetricRegistrable
} from '../../../interfaces';
import { TYPES } from '../../../constants';
import { Metrics } from '../../../types';

/**
 * Prometheus Provider
 *
 * This is a metric provider
 */
@injectable()
export class PrometheusProvider implements MetricRegistrable {
  private readonly loggerService: Loggable;
  private readonly registry: Registry;
  private readonly counter: Counter<string>;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
  ) {
    this.loggerService = loggerService;
    this.registry = new Registry();
    this.counter = new Counter({
      name: 'requestCounter',
      help: 'Requests statistics',
      labelNames: ['successRequests', 'failureRequests'],
      registers: [this.registry],
    });
  }

  /**
   * Returns metric in correct format
   */
  public async formatMetrics(): Promise<[string, string]> {
    this.loggerService.debug('Formatting metrics...');

    const formattedResponse = await this.registry.metrics();
    return [ this.registry.contentType, formattedResponse ];
  }

  /**
   * Saves metrics to registry
   */
  public async setMetrics(metrics: Metrics): Promise<void> {
    this.counter.inc({
      successRequests: metrics.successResponses,
      failureRequests: metrics.failureResponses,
    });

    this.loggerService.debug('Counters are set');
  }

}
