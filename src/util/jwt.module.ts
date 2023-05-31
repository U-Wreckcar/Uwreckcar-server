import jwt from 'jsonwebtoken';
import { User } from '../user/user.types';

const { JWT_SECRET_KEY } = process.env;

class jwtService {
  // Access Token 생성
  createAccessToken = (userData: User) => {
    return jwt.sign(userData, JWT_SECRET_KEY as string, {
      expiresIn : '3h',
    });
  };

  // Refresh Token 생성
  createRefreshToken = (userData: User) => {
    return jwt.sign(userData, JWT_SECRET_KEY as string, { expiresIn : '7d' });
  };

  // Refresh Token 생성
  createKakaoToken = (token: string) => {
    return jwt.sign({
      login_type : 'kakao',
      token,
    }, JWT_SECRET_KEY as string, { expiresIn : '7d' });
  };

  createGoogleToken = (token: string) => {
    return jwt.sign({
      login_type : 'google',
      token,
    }, JWT_SECRET_KEY as string, { expiresIn : '7d' });
  };

  createUwreckcarToken = (token: string) => {
    return jwt.sign({
      login_type : 'uwreckcar',
      token,
    }, JWT_SECRET_KEY as string, { expiresIn : '7d' });
  };

  getTokenPayload = (token: string) => {
    return jwt.verify(token, JWT_SECRET_KEY as string);
  };

  // Access Token 검증
  validateAccessToken = (accessToken: string) => {
    try {
      jwt.verify(accessToken, JWT_SECRET_KEY as string);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Refresh Token 검증
  validateRefreshToken = (refreshToken: string) => {
    try {
      jwt.verify(refreshToken, JWT_SECRET_KEY as string);
      return true;
    } catch (error) {
      return false;
    }
  };
}

export default new jwtService();
