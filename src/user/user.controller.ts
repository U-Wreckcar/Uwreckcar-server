import { getAllUtms, deleteShortUrl } from '../utm/utm.module';
import { Context, Next } from 'koa';
import jwtService from '../util/jwt.module';
import { nanoid } from 'nanoid';
import { CustomContext } from '../util/auth.module';
import {
  createHashedPassword, recordWithdrawReason, deleteUserInfo,
  getHashedPassword, getUserData, setUserInfo,
} from './user.module';
import { verifyAccountToEmail } from '../util/nodemailer.module';

// 회원 탈퇴하기.
export async function withdrawCtr (ctx: Context, next: Next) {
  const { userId } = ctx.state.user;
  const { reason } = ctx.request.body.data;
  const allUtms = await getAllUtms(userId);

  const allShortenUrl = allUtms.map(utm => utm.shortId);

  allShortenUrl.forEach(shortId => deleteShortUrl(shortId));
  await recordWithdrawReason(reason);
  await deleteUserInfo(userId);
  ctx.status = 200;
  ctx.response.body = {
    result : { success : true, message : '' },
    data : {},
  };
  await next();
}

// 유저 정보 가져오기.
export async function getUserProfileCtr (ctx: Context, next: Next) {
  const {
    user_id,
    user_name,
    email,
    profile_img,
    company_name,
  } = ctx.state.user;
  ctx.response.body = {
    result : { success : true, message : '' },
    data : {
      user_id,
      user_name,
      email,
      profile_img,
      company_name,
    },
  };
  await next();
}

// 회원가입 인증 코드 이메일 보내기
export async function sendEmailCtr (ctx: Context & CustomContext, next: Next) {
  const { email } = ctx.request.body.data;
  const dupCheck = await getUserData(email);
  if (dupCheck !== null) {
    ctx.response.body = {
      result : { success : false, message : `${email} is already exists.` },
      data : {},
    };
  } else {
    const verificationCode = nanoid(6);
    ctx.session.verifyCode = verificationCode;
    await verifyAccountToEmail(email, verificationCode);

    ctx.response.body = {
      result : { success : true, message : '' },
      data : {},
    };
  }

  await next();
}

// 인증 코드 검증하기
export async function validateEmailCtr (ctx: Context & CustomContext, next: Next) {
  const { verificationCode } = ctx.request.body.data;
  const { verifyCode } = ctx.session;

  if (verifyCode === verificationCode) {
    ctx.response.body = {
      result : { success : true, message : '' },
      data : {},
    };
  } else {
    ctx.response.body = {
      result : { success : false, message : 'Invalid verifyCode' },
      data : {},
    };
  }
  await next();
}

// uwreckcar 회원 로그인
export async function signinCtr (ctx: Context, next: Next) {
  const { email, password } = ctx.request.body.data;
  const userData = await getUserData(email);

  // 유저 정보가 비어있지 않으면.
  if (userData !== null) {
    const inputPassword = await getHashedPassword(password, userData.salt) as { password: string, salt: string };
    if (userData.password === inputPassword.password) {
      const access_token = jwtService.createAccessToken(userData);
      const refresh_token = jwtService.createRefreshToken(userData);
      ctx.response.body = {
        result : { success : true, message : '' },
        data : {
          userData : {
            user_id : userData.user_id,
            username : userData.username,
            email : userData.email,
            profile_img : userData.profile_img,
            company_name : userData.company_name,
            marketing_accept : userData.marketing_accept,
          },
          access_token,
          refresh_token,
        },
      };
    } else {
      // 비밀번호가 틀렸을 때.
      ctx.response.body = {
        result : { success : false, message : 'Invalid password.' },
        data : {},
      };
    }
  } else {
    // 유저 정보가 null 일 때.
    ctx.response.body = {
      result : { success : false, message : `Couldn't find user ${email}` },
      data : {},
    };
  }
  await next();
}

// uwreckcar 회원가입
export async function signupCtr (ctx: Context, next: Next) {
  const {
    email,
    password,
    company,
    isMarketing,
    name,
  } = ctx.requset.body.data;

  const dupData = await getUserData(email);
  if (dupData) {
    ctx.response.body = {
      result : { success : false, message : `${email} is already exist.` },
      data : {},
    };
  } else {
    const hashPassword = await createHashedPassword(password) as { password: string, salt: string };
    await setUserInfo(
      name,
      email,
      hashPassword.password,
      hashPassword.salt,
      company,
      isMarketing
    );
    ctx.response.body = {
      result : { success : true, message : '' },
      data : {},
    };
  }

  await next();
}