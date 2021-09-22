import 'reflect-metadata';
import { container } from '../../../ioc';
import { TYPES } from '../../../constants';
import {
  EnvConfigReadable,
  MetricGettable,
  MetricPublishable,
  MetricReadable
} from '../../../interfaces';

describe('WeatherMetrics service test cases', () => {
  let getMetricsSpy: jest.SpyInstance;
  let response: [string, string];

  beforeAll(async () => {
    // rebind service which is used for getting env variables used in the method
    const envConfigService = container.get<EnvConfigReadable>(TYPES.envConfig);

    jest
      .spyOn(envConfigService, 'getAwsRegion')
      .mockImplementation(() => {
        return 'us-east-1';
      });

    container
      .rebind(TYPES.envConfig)
      .toConstantValue(envConfigService);

    // get the service and spy on his method
    const metricsStorageService = container
      .get<MetricPublishable & MetricReadable>(TYPES.dynamoDbStorage);

    getMetricsSpy = jest
      .spyOn(metricsStorageService, 'getMetrics')
      .mockImplementation(async () => {
        return {
          successResponses: 12,
          failureResponses: 1,
        };
      });

    container
      .rebind(TYPES.dynamoDbStorage)
      .toConstantValue(metricsStorageService);

    // now get the weatherForecastService instance from the container
    // all his dependencies are mocked so we can call the method
    // and check behavior
    const weatherForecastService = container
      .get<MetricGettable>(TYPES.weatherMetricsService);

    response = await weatherForecastService.getMetrics();
  });

  it('should call spy method', () => {
    expect(getMetricsSpy).toHaveBeenCalled();
  });

  it('should return metrics with mocked values specified above', () => {
    expect(response).toMatchSnapshot();
  });
});
