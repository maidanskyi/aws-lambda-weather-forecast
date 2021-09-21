import { inject } from 'inversify';
import {
  controller,
  httpGet,
  response
} from 'inversify-express-utils';
import { Response } from 'express';

import {
  Loggable,
  MetricGettable
} from '../../interfaces';
import { TYPES } from '../../constants';

@controller('/weather-metrics')
export class WeatherMetricsController {
  private readonly loggerService: Loggable;
  private readonly weatherMetricService: MetricGettable;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
    @inject(TYPES.weatherMetricsService) weatherMetricService: MetricGettable,
  ) {
    this.loggerService = loggerService;
    this.weatherMetricService = weatherMetricService;
  }

  @httpGet('/')
  public async getMetrics(
    @response() res: Response,
  ): Promise<void> {
    this.loggerService.info('Prometheus is grabbing the metrics...');

    const [ contentType, metrics ] = await this.weatherMetricService.getMetrics();

    res.set('Content-Type', contentType);
    res.end(metrics);
  }
}
