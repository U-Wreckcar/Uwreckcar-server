import { Context, DefaultContext, DefaultState, Next } from 'koa';
import jwtService from './jwt.module';
import { JwtPayload } from 'jsonwebtoken';
import { findUserData } from '../user/user.module';
import { Middleware } from '@koa/router';
import axios from 'axios';

export interface CustomContext extends Context {
  session: any;
}

export async function authentication (ctx: CustomContext & Context, next: Next)
  : Promise<Middleware<DefaultState, DefaultContext, unknown>> {
  const refreshToken = ctx.headers['x-refresh-token'] as string;

  // 세션에 사용자 정보가 있는지 확인하고, 있다면 인증을 건너뛰기 - 매 api 요청마다의 인증 생략
  if (!ctx.session.user) {
    ctx.state.user = ctx.session.user;
    return next();
  }

  const [tokenType, tokenValue] = refreshToken.split(' ');

  ctx.assert(tokenType === 'Bearer', 401, 'TokenType is not supported.');

  const {
    login_type,
    token,
  } = await jwtService.getTokenPayload(tokenValue) as JwtPayload;

  switch (login_type) {
    case 'kakao': {
      // refresh_token을 사용하여 새로운 액세스 토큰을 발급.
      const refreshResponse = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        null,
        {
          params : {
            grant_type : 'refresh_token',
            client_id : process.env.REST_API_KEY,
            client_secret : process.env.CLIENT_SECRET_KEY,
            refresh_token : `${token}`,
          },
        }
      );

      // 새로 발급받은 액세스 토큰으로 사용자 정보를 다시 요청.
      const newResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers : {
          Authorization : `Bearer ${refreshResponse.data.access_token}`,
        },
      });

      const userData = await findUserData(newResponse.data.kakao_account.email);
      if (!userData) {
        ctx.response.redirect(`${process.env.CLIENT_URL}/login`);
        break;
      }

      ctx.state.user = userData;
      ctx.session.user = userData;
      await next();
      break;
    }
    case 'google':
      // try {
      //   const accessToken = req.headers.authorization;
      //   const refreshToken = req.headers['x-refresh-token'];
      //
      //   // 1. 받아온 액세스 토큰이 유효한지 확인합니다.
      //   const verifyAccessToken = await axios.get(
      //     `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
      //   );
      //
      //   if (verifyAccessToken.data.audience !== process.env.GOOGLE_ID) {
      //     return res
      //       .status(401)
      //       .json({ errorMessage : '잘못된 access token 입니다.' });
      //   }
      //
      //   // 2. 만료일자 체크
      //   const now = Date.now() / 1000; // 현재시간(UTC)
      //   if (now < verifyAccessToken.data.exp) {
      //     return res.json({ accessToken, refreshToken }); // 만료되지 않았으면 기존 액세스 토큰 사용
      //   }
      //
      //   // 3. 만료 되었다면 새로운 엑세스 토큰 요청
      //   const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      //     params : {
      //       client_id : process.env.GOOGLE_ID,
      //       client_secret : process.env.GOOGLE_SECRET,
      //       grant_type : 'refresh_token',
      //       refresh_token : refreshToken,
      //     },
      //   });
      //
      //   const {
      //     access_token : newAccessToken,
      //     refresh_token : newRefreshToken
      //   } = response.data;
      //
      //   // 4. 새로운 토큰들을 프론트엔드에 전달
      //   return res.json({
      //     accessToken : newAccessToken,
      //     refreshToken : newRefreshToken
      //   });
      // } catch (error) {
      //   console.error(error);
      //   return res
      //     .status(401)
      //     .json({ errorMessage : '유효하지 않은 access token 입니다.' });
      // }
      break;
    case 'uwreckcar': {
      // const valifyToken = jwtService.validateRefreshToken(token);
      // ctx.assert(valifyToken, 401, 'Invalid token');

      const userData = jwtService.getTokenPayload(tokenValue);

      ctx.state.user = userData;
      ctx.session.user = userData;
      await next();
      break;
    }
    default:
      ctx.throw('Invalid token', 400);
  }
}
