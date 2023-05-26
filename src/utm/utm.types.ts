import { ObjectId } from 'bson';

export interface ShortenUrl {
  _id: ObjectId;
  clickCount: number;
  full_url: string;
  shortId: string;
}