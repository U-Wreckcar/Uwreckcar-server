import { ShortenUrlDB, UtmDB } from '../config/mongo.config';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { ObjectId } from 'bson';
import { ShortenUrl } from './utm.types';

// UTM 전체 조회
export async function getAllUtms (userId: string) {
  return await UtmDB.collection('utms').find({ userId }).toArray();
}

// shortenUrl 전체 삭제.
export async function deleteShortUrl (shortId: string) {
  await ShortenUrlDB.collection('betaTest').deleteOne({ shortId });
}

// shortenUrl 클릭 수 가져오기.
export async function getShortUrl (shortId: string) {
  const shortenUrl = await ShortenUrlDB.collection('betaTest').findOne({ shortId }) as ShortenUrl;
  return shortenUrl.clickCount;
}

// UTM data 생성
export async function createUTM (userId: string, inputVal: any) {
  const {
    url,
    campaignId,
    campaignName,
    source,
    medium,
    term,
    content,
    memo,
    createdAt,
  } = inputVal;

  let fullUrl =
    `${url}?utm_source=${encodeURI(source)}&utm_medium=${encodeURI(medium)}&utm_campaign=${encodeURI(campaignName)}`;

  if (term) {
    fullUrl += `&utm_term=${encodeURI(term)}`;
  } else if (content) {
    fullUrl += `&utm_content=${encodeURI(content)}`;
  }

  const short_id = nanoid(10);
  const axiosResponse = await axios.post('https://li.urcurly.site/rd', {
    full_url : fullUrl,
    id : short_id,
  });
  const shortenUrl = axiosResponse.data?.shortUrl;
  if (shortenUrl === undefined) {
    throw new Error('Could not make shortUrl.');
  }

  await UtmDB.collection('utms').insertOne({
    url,
    campaignId : campaignId || '-',
    campaignName,
    content : content || '-',
    memo : memo || '-',
    term : term || '-',
    medium,
    source,
    userId,
    fullUrl,
    shortenUrl : shortenUrl || '-',
    shortId : short_id,
    createdAt : createdAt ? new Date(createdAt) : Date.now(),
  });
  return {
    fullUrl,
    shortenUrl,
  };
}

// UTM 삭제.
export async function deleteUtm (_id: string) {
  await UtmDB.collection('utms').deleteOne({ _id : new ObjectId(_id) });
}

// UTM 메모 내용 업데이트.
export async function updateMemo (_id: string, memo: string) {
  await UtmDB.collection('utms').findOneAndUpdate({ _id : new ObjectId(_id) }, {
    $set : {
      memo,
    },
  });
}