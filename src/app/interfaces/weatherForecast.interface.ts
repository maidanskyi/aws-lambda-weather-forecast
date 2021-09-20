/* eslint-disable no-unused-vars */
import {
  WeatherByCityIdType,
  WeatherByZipCodeType
} from '../types';

export interface WeatherForecastGettable {
  getByCityId(
    cityId: string,
    apiKey: string,
  ): Promise<Record<string, any>>

  getByCityName(
    params: WeatherByCityIdType
  ): Promise<Record<string, any>>

  getByLocation(
    geoLocation: [string, string],
    apiKey: string,
  ): Promise<Record<string, any>>

  getByZipCode(
    params: WeatherByZipCodeType,
  ): Promise<Record<string, any>>
}
