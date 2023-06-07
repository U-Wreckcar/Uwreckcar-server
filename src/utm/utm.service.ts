import { UTM } from './utm.types';
import jsonToXlsx, { IContent, IJsonSheet } from 'json-as-xlsx';
import xlsx from 'xlsx';

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
  jsonToXlsx(sheetData, settings, () => {
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

// Excel file parser
export function parseExcel (file: any) {
  const workbook = xlsx.readFile(file.filepath);
  const sheet_name_list = workbook.SheetNames;
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
}

// Split full url parser
export function parseFullUrl (url: string, memo: string, createdAt: string) {
  const doc: { [k: string]: string } = {
    createdAt,
    memo,
  };

  const [baseUrl, utmResources] = url.split('?');
  doc['url'] = baseUrl;
  const splitResources = utmResources.split('&');

  splitResources.forEach((data: string) => {
    const [encodeType, encodeValue] = data.split('=');
    const utmType = decodeURI(encodeType);
    const utmValue = decodeURI(encodeValue);
    if (utmType === 'utm_campaign') {
      doc['campaignName'] = decodeURI(utmValue);
    } else if (utmType === 'utm_term') {
      doc['term'] = decodeURI(utmValue);
    } else if (utmType === 'utm_content') {
      doc['content'] = decodeURI(utmValue);
    } else if (utmType === 'utm_source') {
      doc['source'] = decodeURI(utmValue);
    } else if (utmType === 'utm_medium') {
      doc['medium'] = decodeURI(utmValue);
    }
  });
  return doc;
}