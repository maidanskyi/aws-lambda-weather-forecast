/* eslint-disable no-unused-vars */
import { WeatherByCityIdType } from '../types';

export interface WeatherForecastGettable {
  getByCityName(
    params: WeatherByCityIdType
  ): Promise<Record<string, any>>
}
