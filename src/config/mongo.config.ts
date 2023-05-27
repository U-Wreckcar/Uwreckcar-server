import { MongoClient } from 'mongodb';

const { SERVER_MONGODB_URI, MONGODB_URI } = process.env;

// Replace the following with your Atlas connection string
const url = `${SERVER_MONGODB_URI}`;
const client = new MongoClient(url);

const shortenClient = new MongoClient(`${MONGODB_URI}`);

export default async function run () {
  try {
    await client.connect();
    console.log('mongodb  Connected.');
    await shortenClient.connect();
    console.log('shortenDB Connected.');
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.stack);
    }
  }
}

export const UserDB = client.db('Users');
export const UtmDB = client.db('UTMs');
export const ShortenUrlDB = shortenClient.db('shortUrl');
