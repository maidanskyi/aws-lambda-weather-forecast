import { Container } from 'inversify';

import { TYPES } from '../constants';
import {
  EnvConfigReadable,
  Loggable,
  SecretReadable
} from '../interfaces';
import {
  AwsSecretManagerProvider,
  EnvConfigurationProvider,
  PinoConsoleLoggerProvider
} from '../providers';

export const container = new Container();

container
  .bind<SecretReadable>(TYPES.awsSecretManager)
  .to(AwsSecretManagerProvider);

container
  .bind<EnvConfigReadable>(TYPES.envConfig)
  .to(EnvConfigurationProvider);

container
  .bind<Loggable>(TYPES.pinoConsoleLogger)
  .to(PinoConsoleLoggerProvider);
