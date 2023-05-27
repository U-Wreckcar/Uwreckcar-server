import { ShortenUrlDB, UtmDB } from '../config/mongo.config';
import { nanoid } from 'nanoid';
import axios from 'axios';
import xlsx, { IContent, IJsonSheet } from 'json-as-xlsx';
import { ObjectId } from 'bson';
import { ShortenUrl, UTM } from './utm.types';

// UTM 전체 조회
export async function getAllUtms (userId: string) {
  return await UtmDB.collection('utms').find({ userId : new ObjectId(userId) }).toArray();
}

// shortenUrl 전체 삭제.
export async function deleteShortUrl (shortId: string) {
  await ShortenUrlDB.collection('betaTest').deleteOne({ shortId });
}

// shortenUrl 클릭 수 가져오기.
export async function getShortUrlClickCount (shortId: string) {
  const shortenUrl = await ShortenUrlDB.collection('betaTest').findOne({ shortId }) as ShortenUrl;
  return shortenUrl.clickCount;
}

// UTM data 생성
export async function createUTM (userId: number, inputVal: any) {
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

  let fullUrl = `${url}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaignName}`;

  if (term) {
    fullUrl += `&utm_term=${term}`;
  } else if (content) {
    fullUrl += `&utm_content=${content}`;
  }

  const short_id = nanoid(10);
  const axiosResponse = await axios.post('https://li.urcurly.site/rd', {
    fullUrl,
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
    short_id,
    createdAt : new Date(createdAt) || Date.now(),
  });
}

// UTM 삭제.
export async function deleteUtm (_id: number) {
  await UtmDB.collection('utms').deleteOne({ _id : new ObjectId(_id) });
}

// Excel file 추출하기.
export async function createExcelFile (filename: string, data: Array<UTM> & IContent[]) {
  const sheetData: IJsonSheet[] = [
    {
      sheet : 'MyUTM',
      columns : [
        { label : 'utm_url', value : 'url' },
        { label : 'utm_campaign_id', value : 'campaignId' },
        { label : 'utm_campaign_name', value : 'campaignName' },
        { label : 'utm_medium', value : 'medium' },
        { label : 'utm_source', value : 'source' },
        { label : 'utm_content', value : 'content' },
        { label : 'utm_term', value : 'term' },
        { label : 'utm_memo', value : 'memo' },
        { label : 'full_url', value : 'fullUrl' },
        { label : 'shorten_url', value : 'shortenUrl' },
        { label : 'created_at', value : 'createdAt' },
      ],
      content : data,
    },
  ];
  const settings = {
    fileName : `./temp/${filename}`,
    extraLength : 11, // A bigger number means that columns will be wider
    writeMode : 'writeFile', // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
    writeOptions : {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
    RTL : false, // Display the columns from right-to-left (the default value is false)
  };
  xlsx(sheetData, settings, () => {
    console.log(`./temp/${filename}.xlsx file created.`);
  });
}

// CSV file 추출하기.
export async function createCSVFile (data: Array<UTM>) {
  const columns: Array<any> = [];
  Object.keys(data[0]).forEach(col => {
    columns.push(col);
  });
  let csvData = columns.join(',') + '\r\n';

  data.forEach((doc: any) => {
    const utmData: Array<string> = [];
    Object.keys(doc).forEach((key: string) => {
      csvData += utmData.push(doc[key]);
    });
    csvData += utmData.join(',') + '\r\n';
  });

  return csvData;
}
