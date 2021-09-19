import { Container } from 'inversify';
import { TYPES } from '../constants';
import { Loggable } from '../interfaces';
import { PinoConsoleLoggerProvider } from '../providers';

export const container = new Container();

container.bind<Loggable>(TYPES.pinoConsoleLogger).to(PinoConsoleLoggerProvider);
