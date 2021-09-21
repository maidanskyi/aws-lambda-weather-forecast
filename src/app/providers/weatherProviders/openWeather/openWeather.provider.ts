import axios, { AxiosError, AxiosInstance } from 'axios';
import { injectable, inject } from 'inversify';

import {
  Loggable,
  WeatherForecastGettable,
  MetricReadable,
  MetricPublishable
} from '../../../interfaces';
import { WeatherByCityIdType } from '../../../types';
import { HttpException } from '../../../exceptions';
import { TYPES } from '../../../constants';

/**
 * Open Weather provider
 *
 * This provider allows us to get weather forecast
 */
@injectable()
export class OpenWeatherProvider implements WeatherForecastGettable {

  public static baseForecastUrl = 'api.openweathermap.org';
  public static forecastPathUrl = '/data/2.5/forecast';
  private readonly loggerService: Loggable;
  private readonly metricsStorageService: MetricReadable & MetricPublishable;
  private readonly axiosInstance: AxiosInstance;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
    @inject(TYPES.dynamoDbStorage) metricsStorageService: MetricReadable & MetricPublishable,
  ) {
    this.loggerService = loggerService;
    this.metricsStorageService = metricsStorageService;
    this.axiosInstance = axios.create({
      method: 'GET',
      url: OpenWeatherProvider.forecastPathUrl,
      baseURL: `https://${OpenWeatherProvider.baseForecastUrl}`,
    });
  }

  /**
   * Returns weather forecast
   */
  public async getByCityName(
    params: WeatherByCityIdType,
  ): Promise<Record<string, any>> {
    this.loggerService.info('Getting weather forecast from external resource');

    let response;
    const paramsSerializer = (params: WeatherByCityIdType) => {
      let queryString = `q=${params.cityName}`;

      if (params.stateCode) {
        queryString += `,${params.stateCode}`;
      }

      if (params.countryCode) {
        queryString += `,${params.countryCode}`;
      }

      queryString += `&appid=${params.apiKey}`;

      this.loggerService.debug(`Query string: ${queryString}`);

      return queryString;
    };
    const url = 'https://' + OpenWeatherProvider.baseForecastUrl + '/'
      + OpenWeatherProvider.forecastPathUrl + '?'
      + paramsSerializer(params);

    try {
      response = await this.axiosInstance.request({url});

      // await this.metricsStorageService.updateSuccessMetric();
    } catch (err: unknown) {
      await this.metricsStorageService.updateFailureMetric();

      let errorMessage = 'Error getting weather by cityName';

      if ((err as AxiosError).isAxiosError) {
        errorMessage = (err as AxiosError).message;
      }

      throw new HttpException(500, errorMessage);
    }

    this.loggerService.debug(
      'Returns data from form getByCityName method',
      response.data,
    );

    this.loggerService.info('Weather forecast successfully received');

    return response.data;
  }

}
