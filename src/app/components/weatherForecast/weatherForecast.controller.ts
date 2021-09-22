import { inject } from 'inversify';
import {
  controller,
  httpGet,
  queryParam
} from 'inversify-express-utils';

import { TYPES } from '../../constants';
import {
  Loggable,
  WeatherForecastCallable
} from '../../interfaces';

/**
 * Weather Forecast controller
 */
@controller('/weather-forecast')
export class WeatherForecastController {
  private readonly loggerService: Loggable;
  private readonly weatherForecastService: WeatherForecastCallable;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
    @inject(TYPES.weatherForecastService) weatherForecastService: WeatherForecastCallable,
  ) {
    this.loggerService = loggerService;
    this.weatherForecastService = weatherForecastService;
  }

  @httpGet('/')
  public async getWeatherByCity(
    @queryParam('cityName') cityName: string,
    @queryParam('stateCode') stateCode: string,
    @queryParam('countryCode') countryCode: string,
  ): Promise<Record<string, any>> {
    const input = {
      cityName,
      stateCode,
      countryCode,
    };

    this.loggerService.info(`Weather controller`, input);

    const response = await this.weatherForecastService.getWeatherForecast(input);

    this.loggerService.debug(`Weather controller response`, response);

    return response;
  }

}
