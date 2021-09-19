/* eslint-disable no-unused-vars */

export interface WeatherForecastGettable {
  getByCityName(cityName: string): Promise<JSON>
  getByCityId(cityId: string): Promise<JSON>
  getByLocation(location: [string, string]): Promise<JSON>
  getByZipCode(zipCode: string): Promise<JSON>
}
