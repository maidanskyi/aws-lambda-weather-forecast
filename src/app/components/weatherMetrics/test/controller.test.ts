import 'reflect-metadata';
import supertest from 'supertest';
import { InversifyExpressServer } from 'inversify-express-utils';

import '../../../components';
import { container } from '../../../ioc';
import { TYPES } from '../../../constants';
import { EnvConfigReadable, MetricGettable } from '../../../interfaces';


describe('', () => {
  let response: supertest.Response;
  let getMetricsSpy: jest.SpyInstance;

  beforeAll(async () => {
    const envConfigService = container.get<EnvConfigReadable>(TYPES.envConfig);

    jest
      .spyOn(envConfigService, 'getAwsRegion')
      .mockImplementation(() => {
        return 'us-east-1';
      });

    container
      .rebind(TYPES.envConfig)
      .toConstantValue(envConfigService);

    const weatherMetricService = container
      .get<MetricGettable>(TYPES.weatherMetricsService);

    getMetricsSpy = jest
      .spyOn(weatherMetricService, 'getMetrics')
      .mockImplementation(async () => {
        return ['X-Header-Prometheus', 'PROMETHEUS-METRICS'];
      });

    container
      .rebind(TYPES.weatherMetricsService)
      .toConstantValue(weatherMetricService);

    const server = new InversifyExpressServer(container).build();

    response = await supertest(server).get('/weather-metrics');
  });

  it('should call mocked getMetrics method', () => {
    expect(getMetricsSpy).toHaveBeenCalled();
  });

  it('Content-Type should be equal X-Header-Prometheus', () => {
    expect(response.headers['content-type']).toMatchSnapshot();
  });

  it('response text should be PROMETHEUS-METRICS', () => {
    expect(response.text).toMatchSnapshot();
  });
});
