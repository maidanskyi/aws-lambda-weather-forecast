import { Container } from 'inversify';

import { TYPES } from '../constants';
import {
  Loggable,
  SecretReadable
} from '../interfaces';
import {
  AwsSecretManagerProvider,
  PinoConsoleLoggerProvider
} from '../providers';

export const container = new Container();

container
  .bind<SecretReadable>(TYPES.awsSecretManager)
  .to(AwsSecretManagerProvider);

container
  .bind<Loggable>(TYPES.pinoConsoleLogger)
  .to(PinoConsoleLoggerProvider);
