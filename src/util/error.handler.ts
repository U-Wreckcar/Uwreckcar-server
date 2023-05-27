import { Context, Next } from 'koa';
import Slack from '../config/slack.config';

export default async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof Error) {
      await Slack(err.message, err.stack!);
      ctx.status = 400;
      ctx.response.body = {
        result : { success : false, message : err.message },
        data : {
          name : err.name,
          message : err.message,
          stack : err.stack,
        },
      };
      ctx.app.emit('error', err, ctx);
    }
  }
};