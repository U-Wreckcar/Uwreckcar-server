import { ObjectId } from 'bson';

export interface ShortenUrl {
  _id: any;
  clickCount: number;
  full_url: string;
  shortId: string;
}

export interface UTM {
  _id: any;
  userId: string;
  url: string;
  campaignId: string;
  campaignName: string;
  content: string;
  term: string;
  memo: string;
  fullUrl: string;
  shortenUrl: string;
  shortId: string;
  medium: string;
  source: string;
  createdAt: string;
}