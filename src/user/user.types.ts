import { ObjectId } from 'bson';

export interface User {
  _id: ObjectId;
  userId?: string;
  name: string;
  email: string;
  profileImg: string;
  password: string;
  salt: string;
  company: string;
  isMarketing: boolean;
  createdAt: string;
  loginType: string;
}