import { controller, httpGet, queryParam } from 'inversify-express-utils';

@controller('/weather')
export class WeatherForecastController {

  @httpGet('/')
  public getWeatherByCity(
    @queryParam('city') city: string,
  ): string {
    return `in next four hours it will be sunny at ${city}`;
  }

}
