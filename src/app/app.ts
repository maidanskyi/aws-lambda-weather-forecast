import 'reflect-metadata';
import './controllers';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './ioc';

const server = new InversifyExpressServer(container);

export const app = server.build();
