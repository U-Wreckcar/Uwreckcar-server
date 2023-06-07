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
import { responseBody } from '../util/api.helper';

// 회원 탈퇴하기.
export async function withdrawCtr (ctx: Context, next: Next) {
  const { _id } = ctx.state.user;
  const { reason } = ctx.request.body.data;
  const allUtms = await getAllUtms(_id.toString());

  const allShortenUrl = allUtms.map(utm => utm.shortId);

  allShortenUrl.forEach(shortId => deleteShortUrl(shortId));
  await recordWithdrawReason(reason);
  await deleteUserInfo(_id.toString());

  ctx.response.body = responseBody(true, '', {});
  await next();
}

// 유저 정보 가져오기.
export async function getUserProfileCtr (ctx: Context, next: Next) {
  const {
    _id,
    name,
    email,
    profileImg,
    company,
  } = ctx.state.user;
  ctx.response.body = responseBody(true, '', {
    userId : _id.toString(),
    name,
    email,
    profileImg,
    company,
  });
  await next();
}

// 회원가입 인증 코드 이메일 보내기
export async function sendEmailCtr (ctx: Context & CustomContext, next: Next) {
  const { email } = ctx.request.body.data;
  const dupCheck = await getUserData(email);
  if (dupCheck !== null) {
    ctx.response.body = responseBody(false, `${email} is already exists.`, {});
  } else {
    const verificationCode = nanoid(6);
    ctx.session.verifyCode = verificationCode;
    await verifyAccountToEmail(email, verificationCode);

    ctx.response.body = responseBody(true, '', {});
  }

  await next();
}

// 인증 코드 검증하기
export async function validateEmailCtr (ctx: Context & CustomContext, next: Next) {
  const { verificationCode } = ctx.request.body.data;
  const { verifyCode } = ctx.session;

  if (verifyCode === verificationCode) {
    ctx.response.body = responseBody(true, '', {});
  } else {
    ctx.response.body = responseBody(false, 'Invalid verifyCode', {});
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
      const token = jwtService.createAccessToken(userData);
      ctx.response.body = {
        result : { success : true, message : '' },
        data : {
          userData : {
            userId : userData._id.toString(),
            name : userData.name,
            email : userData.email,
            profileImg : userData.profileImg,
            company : userData.company,
            isMarketing : userData.isMarketing,
          },
          token,
        },
      };
    } else {
      // 비밀번호가 틀렸을 때.
      ctx.response.body = responseBody(false, 'Invalid password.', {});
    }
  } else {
    // 유저 정보가 null 일 때.
    ctx.response.body = responseBody(false, `Couldn't find user ${email}`, {});
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
  } = ctx.request.body.data;

  const dupData = await getUserData(email);
  if (dupData) {
    ctx.response.body = responseBody(false, `${email} is already exist.`, {});
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
    ctx.response.body = responseBody(true, '', {});
  }

  await next();
}