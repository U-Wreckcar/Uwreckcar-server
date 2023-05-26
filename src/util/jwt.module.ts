import jwt from 'jsonwebtoken';
import { Users } from '../../models/users';

const { JWT_SECRET_KEY } = process.env;

class jwtService {
  // Access Token 생성
  createAccessToken = (userData: Users) => {
    return jwt.sign(userData, JWT_SECRET_KEY, {
      expiresIn : '3h',
    });
  };

  // Refresh Token 생성
  createRefreshToken = (userData: Users) => {
    return jwt.sign(userData, JWT_SECRET_KEY, { expiresIn : '7d' });
  };

  // Refresh Token 생성
  createKakaoToken = (token: string) => {
    return jwt.sign({
      login_type : 'kakao',
      token,
    }, JWT_SECRET_KEY, { expiresIn : '7d' });
  };

  createGoogleToken = (token: string) => {
    return jwt.sign({
      login_type : 'google',
      token,
    }, JWT_SECRET_KEY, { expiresIn : '7d' });
  };

  createUwreckcarToken = (token: string) => {
    return jwt.sign({
      login_type : 'uwreckcar',
      token,
    }, JWT_SECRET_KEY, { expiresIn : '7d' });
  };

  getTokenPayload = (token: string) => {
    return jwt.verify(token, JWT_SECRET_KEY);
  };

  // Access Token 검증
  validateAccessToken = (accessToken: string) => {
    try {
      jwt.verify(accessToken, JWT_SECRET_KEY);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Refresh Token 검증
  validateRefreshToken = (refreshToken: string) => {
    try {
      jwt.verify(refreshToken, JWT_SECRET_KEY);
      return true;
    } catch (error) {
      return false;
    }
  };
}

export default new jwtService();
