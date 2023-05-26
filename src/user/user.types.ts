import { ObjectId } from 'bson';

export interface User {
  _id: ObjectId;
  user_id: string;
  username: string;
  email: string;
  profile_img: string;
  password: string;
  salt: string;
  company_name: string;
  marketing_accept: string;
  created_at: string;
  updated_at: string;
  login_type: string;
}