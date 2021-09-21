import {
  inject,
  injectable
} from 'inversify';

import {
  EnvConfigReadable,
  Loggable,
  SecretReadable,
  WeatherForecastCallable,
  WeatherForecastGettable
} from '../../interfaces';
import { TYPES } from '../../constants';
import { WeatherByCityIdType } from '../../types';
import { HttpException } from '../../exceptions';

/**
 * This class contains all weather forecast business logic
 */
@injectable()
export class WeatherForecastService implements WeatherForecastCallable {

  private readonly envConfigService: EnvConfigReadable;
  private readonly loggerService: Loggable;
  private readonly secretService: SecretReadable;
  private readonly weatherService: WeatherForecastGettable;

  constructor(
    @inject(TYPES.envConfig) envConfigService: EnvConfigReadable,
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
    @inject(TYPES.awsSecretManager) secretService: SecretReadable,
    @inject(TYPES.openWeather) weatherService: WeatherForecastGettable,
  ) {
    this.envConfigService = envConfigService;
    this.loggerService = loggerService;
    this.secretService = secretService;
    this.weatherService = weatherService;
  }

  /**
   * Contains the weather business logic
   */
  public async getWeatherForecast(
    params: Omit<WeatherByCityIdType,'apiKey'>,
  ): Promise<Record<string, any>> {
    this.loggerService.info('WeatherForecastService handling request...');

    const apiKeyAttributeName = this.envConfigService
      .getWeatherApiKeyAttributeName();

    const secrets = await this.secretService.getSecretsByName();

    if (!secrets[apiKeyAttributeName]) {
      throw new HttpException(
        400,
        'The attribute key provided in WEATHER_API_KEY_ATTRIBUTE_NAME ' +
        'env variable can\'t be found in your secrets',
      );
    }

    const response = await this.weatherService.getByCityName({
      ...params,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      apiKey: secrets[apiKeyAttributeName]!,
    });

    this.loggerService.info('Request is handled by WeatherForecastService');

    return response;
  }

}
