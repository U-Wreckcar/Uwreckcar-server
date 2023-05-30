import dotenv from 'dotenv';
import path from 'path';

// NODE_ENV 에 맞게 env 파일 설정.
if (process.env.NODE_ENV === 'production') {
  console.log(process.env.NODE_ENV);
  dotenv.config({ path : path.join(__dirname, '/.env.production') });
} else if (process.env.NODE_ENV === 'development') {
  console.log(process.env.NODE_ENV);
  dotenv.config({ path : path.join(__dirname, '/.env.local') });
} else {
  console.error('Not defined process.env.NODE_ENV');
  throw new Error('Not defined process.env.NODE_ENV');
}

import Koa, { Context, Next } from 'koa';
import { koaBody } from 'koa-body';
import errorHandler from './src/util/error.handler';
import cors from '@koa/cors';
import dbRun from './src/config/mongo.config';
import session from 'koa-session';
import { userRouter } from './src/user/user.routes';
import { utmRouter } from './src/utm/utm.routes';

const { PORT, SESSION_SECRET_KEY } = process.env;

const app = new Koa();

// mongoDB connection.
(async () => dbRun())();

app.use(cors({
  origin : '*',
  credentials : true,
}));

// @ts-ignore
app.keys = [SESSION_SECRET_KEY];
app.use(session(app));

app.use(koaBody());
app.use(errorHandler);

app.use(userRouter.routes()).use(userRouter.prefix('/api/users').allowedMethods());
app.use(utmRouter.routes()).use(utmRouter.prefix('/api/utms').allowedMethods());
app.use(async (ctx: Context, next: Next) => {
  ctx.response.body = 'uwreckcar';
  await next();
});

app.on('error', (err: Error) => {
  console.error('Error Listener : ', err);
});

app.listen(process.env.PORT, () => console.log(`Server is running on port ${PORT}`));
