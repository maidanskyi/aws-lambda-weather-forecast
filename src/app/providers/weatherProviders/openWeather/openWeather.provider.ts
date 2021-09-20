import axios, { AxiosError, AxiosInstance } from 'axios';
import { injectable, inject } from 'inversify';

import {
  Loggable,
  WeatherForecastGettable
} from '../../../interfaces';
import {
  WeatherByCityIdType,
  WeatherByZipCodeType
} from '../../../types';
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
  private readonly axiosInstance: AxiosInstance;

  constructor(
    @inject(TYPES.pinoConsoleLogger) loggerService: Loggable,
  ) {
    this.loggerService = loggerService;
    this.axiosInstance = axios.create({
      method: 'GET',
      url: OpenWeatherProvider.forecastPathUrl,
      baseURL: `http://${OpenWeatherProvider.baseForecastUrl}/`,
    });
  }

  /**
   * Returns weather forecast
   */
  public async getByCityId(
    cityId: string,
    apiKey: string,
  ): Promise<Record<string, any>> {
    this.loggerService.info('Getting weather forecast from external resource');

    try {
      const response = await this.axiosInstance.request({
        params: {
          id: cityId,
          appid: apiKey,
        },
      });

      // TODO post response to prometheus

      this.loggerService.debug(
        'Returns data from form getByCityId method',
        response.data,
      );

      this.loggerService.info('Weather forecast successfully received');

      return response.data;
    } catch (err: unknown) {
      // TODO post an error to prometheus
      let errorMessage = '';

      if ((err as AxiosError).isAxiosError) {
        errorMessage = (err as AxiosError).message;
      }

      throw new HttpException(
        500,
        errorMessage || 'Error getting weather by cityId',
      );
    }
  }

  /**
   * Returns weather forecast
   */
  public async getByCityName(
    params: WeatherByCityIdType,
  ): Promise<Record<string, any>> {
    this.loggerService.info('Getting weather forecast from external resource');

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

    try {
      const response = await this.axiosInstance.request({
        params,
        paramsSerializer,
      });

      // TODO post response to prometheus

      this.loggerService.debug(
        'Returns data from form getByCityName method',
        response.data,
      );

      this.loggerService.info('Weather forecast successfully received');

      return response.data;
    } catch (err: unknown) {
      // TODO post an error to prometheus
      let errorMessage = '';

      if ((err as AxiosError).isAxiosError) {
        errorMessage = (err as AxiosError).message;
      }

      throw new HttpException(
        500,
        errorMessage || 'Error getting weather by cityName',
      );
    }
  }

  /**
   * Returns weather forecast
   */
  public async getByLocation(
    geoLocation: [string, string],
    apiKey: string,
  ): Promise<Record<string, any>> {
    this.loggerService.info('Getting weather forecast from external resource');

    const [lat, lon] = geoLocation;

    try {
      const response = await this.axiosInstance.request({
        params: {
          lat,
          lon,
          appid: apiKey,
        },
      });

      // TODO post response to prometheus

      this.loggerService.debug(
        'Returns data from form getByLocation method',
        response.data,
      );

      this.loggerService.info('Weather forecast successfully received');

      return response.data;
    } catch (err: unknown) {
      // TODO post an error to prometheus
      let errorMessage = '';

      if ((err as AxiosError).isAxiosError) {
        errorMessage = (err as AxiosError).message;
      }

      throw new HttpException(
        500,
        errorMessage || 'Error getting weather by location',
      );
    }
  }

  /**
   * Returns weather forecast
   */
  public async getByZipCode(
    params: WeatherByZipCodeType,
  ): Promise<Record<string, any>> {
    this.loggerService.info('Getting weather forecast from external resource');

    const paramsSerializer = (params: WeatherByZipCodeType) => {
      let queryString = `zip=${params.zipCode}`;

      if (params.countryCode) {
        queryString += `,${params.countryCode}`;
      }

      queryString += `&appid=${params.apiKey}`;

      this.loggerService.debug(`Query string: ${queryString}`);

      return queryString;
    };

    try {
      const response = await this.axiosInstance.request({
        params,
        paramsSerializer,
      });

      // TODO post response to prometheus

      this.loggerService.debug(
        'Returns data from form getByZipCode method',
        response.data,
      );

      this.loggerService.info('Weather forecast successfully received');

      return response.data;
    } catch (err: unknown) {
      // TODO post an error to prometheus
      let errorMessage = '';

      if ((err as AxiosError).isAxiosError) {
        errorMessage = (err as AxiosError).message;
      }

      throw new HttpException(
        500,
        errorMessage || 'Error getting weather by zipCode',
      );
    }
  }

}
