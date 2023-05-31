import { UserDB } from '../config/mongo.config';
import crypto from 'crypto';
import { User } from './user.types';
import { ObjectId } from 'bson';

// 유저 정보 생성.
export async function setUserInfo (
  name: string,
  email: string,
  password: string,
  salt: string,
  company: string,
  isMarketing: boolean
) {
  await UserDB.collection('userInfo').insertOne({
    name,
    profile_img :
      'https://velog.velcdn.com/images/tastekim_/post/60f96a34-2142-43fe-b109-9312af658a3d/image.png',
    email,
    password,
    salt,
    company,
    isMarketing,
    loginType : 'uwreckcar',
    createdAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, -5),
  });
}

// 유저 정보 가져오기.
export async function getUserData (email: string): Promise<User | null> {
  return await UserDB.collection('userInfo').findOne({ email }) as User | null;
}

// 유저 정보 삭제하기.
export async function deleteUserInfo (userId: string) {
  await UserDB.collection('userInfo').deleteOne({ _id: new ObjectId(userId) });
}

// 탈퇴 사유 저장.
export async function recordWithdrawReason (reason: string) {
  await UserDB.collection('withDraw').insertOne({ reason });
}

export function createSalt () {
  const salt = crypto.randomBytes(64);
  return salt.toString('base64');
}

export const createHashedPassword = (plainPassword: string) =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve, reject) => {
    const salt = createSalt();
    if (!salt) {
      reject(new Error('failed to create salt'));
    } else {
      crypto.pbkdf2(plainPassword, salt, 999, 64, 'sha512', (err, key) => {
        if (err) {
          reject(err);
        }
        resolve({ password : key.toString('base64'), salt });
      });
    }
  });

export const getHashedPassword = (plainPassword: string, salt: string) =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve, reject) => {
    crypto.pbkdf2(plainPassword, salt, 999, 64, 'sha512', (err, key) => {
      if (err) {
        reject(err);
      }
      resolve({ password : key.toString('base64'), salt });
    });
  });

// export async function setNewPassword (email: string, password: string, salt: string) {
//   await userRepository.update({
//     password : password,
//     salt : salt,
//   }, { where : { email } });
//   return true;
// }