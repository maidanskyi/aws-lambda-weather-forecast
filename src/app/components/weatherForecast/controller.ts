import { inject } from 'inversify';
import { controller, httpGet, queryParam } from 'inversify-express-utils';
import { TYPES } from '../../constants';
import { Loggable } from '../../interfaces';

@controller('/weather')
export class WeatherForecastController {
  private readonly loggerService: Loggable;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
  ) {
    this.loggerService = loggerService;
  }

  @httpGet('/')
  public getWeatherByCity(
    @queryParam('city') city: string,
  ): string {
    this.loggerService.error(`looking for weather at ${city}`);

    return `in next four hours it will be sunny at ${city}`;
  }

}
