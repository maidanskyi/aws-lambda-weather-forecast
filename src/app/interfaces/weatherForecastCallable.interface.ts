/* eslint-disable no-unused-vars */
import { WeatherByCityIdType } from '../types';

export interface WeatherForecastCallable {
  getWeatherForecast(
    params: Omit<WeatherByCityIdType,'apiKey'>
  ): Promise<Record<string, any>>
}
