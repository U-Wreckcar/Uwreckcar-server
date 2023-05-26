import Router from '@koa/router';
import { Context } from 'koa';
import { authentication } from '../util/auth.module';
import {
  getUserProfileCtr, sendEmailCtr, signinCtr,
  signupCtr, withdrawCtr, validateEmailCtr,
} from './user.controller';

const router = new Router<{}, Context>();

export const userRouter = router
  .use(['/', '/withdrawal'], authentication)
  .get('USER 정보 가져오기', '/', getUserProfileCtr)
  .post('USER 유렉카 회원 탈퇴', '/withdraw', withdrawCtr)
  .post('USER 유렉카 회원가입 인증 메일', '/email', sendEmailCtr)
  .post('USER 이메일 인증번호 확인', '/verify-code', validateEmailCtr)
  .post('USER 유렉카 로그인', '/login', signinCtr)
  .post('USER 유렉카 회원가입', '/signup', signupCtr);