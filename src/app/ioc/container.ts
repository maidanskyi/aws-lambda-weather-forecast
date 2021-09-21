import { Container } from 'inversify';

import { TYPES } from '../constants';
import {
  EnvConfigReadable,
  Loggable,
  SecretReadable,
  MetricPublishable,
  MetricReadable,
  WeatherForecastCallable,
  WeatherForecastGettable
} from '../interfaces';
import {
  AwsSecretManagerProvider,
  DynamoDbProvider,
  EnvConfigurationProvider,
  OpenWeatherProvider,
  PinoConsoleLoggerProvider
} from '../providers';
import { WeatherForecastService } from '../components';

export const container = new Container();

container
  .bind<SecretReadable>(TYPES.awsSecretManager)
  .to(AwsSecretManagerProvider);

container
  .bind<MetricPublishable & MetricReadable>(TYPES.dynamoDbStorage)
  .to(DynamoDbProvider);

container
  .bind<EnvConfigReadable>(TYPES.envConfig)
  .to(EnvConfigurationProvider);

container
  .bind<WeatherForecastGettable>(TYPES.openWeather)
  .to(OpenWeatherProvider);

container
  .bind<Loggable>(TYPES.pinoConsoleLogger)
  .to(PinoConsoleLoggerProvider);

container
  .bind<WeatherForecastCallable>(TYPES.weatherForecastService)
  .to(WeatherForecastService);
