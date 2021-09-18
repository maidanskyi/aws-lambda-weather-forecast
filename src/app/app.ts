import 'reflect-metadata';
import './controllers';
import { Application, NextFunction, Request, Response } from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './ioc';
import { HttpException } from './exceptions';

const server = new InversifyExpressServer(container);

export const app = server
  .setErrorConfig((app: Application) => {
    app.use((req: Request, res: Response, next: NextFunction) => {
      next(new HttpException(404, 'Not Found'));
    });

    app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof HttpException) {
        return res
          .status(err.status)
          .json({
            message: err.message,
          });
      }

      return res
        .status(500)
        .json({
          message: err instanceof Error ? err.message : 'Unexpected error',
        });
    });
  })
  .build();
