import express, { NextFunction, Request, Response } from 'express';

const app = express();

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.get('/hi', (_req, res) => {
  res.send('Hi World!');
});

app.post('/', (_req, res) => {
  res.send('Good morning!');
});

app.post('/hi/:name', (req, res) => {
  const { name } = req.params;
  res.send(`Hi ${name}`);
});

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  console.error((err as any).stack);
  res.status(500).send('Something broke!');
  next();
});


export const sum = (a: number, b: number): number => a + b;

export default app;
