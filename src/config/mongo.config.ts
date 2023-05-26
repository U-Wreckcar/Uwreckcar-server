import { MongoClient } from 'mongodb';

const { SERVER_MONGODB_URI } = process.env;

// Replace the following with your Atlas connection string
const url = `${SERVER_MONGODB_URI}`;
const client = new MongoClient(url);

export default async function run () {
  try {
    await client.connect();
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.stack);
    }
  }
}

export const UserDB = client.db('Users');
export const UtmDB = client.db('UTMs');
export const ShortenUrlDB = client.db('shortUrl');
