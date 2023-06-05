import { Context, Next } from 'koa';
import {
  getAllUtms,
  deleteShortUrl,
  createUTM,
  deleteUtm,
  getShortUrl, updateMemo,
} from './utm.module';
import { createExcelFile, createCSVFile, parseExcel, parseFullUrl } from './utm.service';
import fs from 'fs';
import { UTM } from './utm.types';
import { responseBody } from '../util/api.helper';

// 전체 UTM 가져오기.
export async function getAllUtmsCtr (ctx: Context, next: Next) {
  const { _id } = ctx.state.user;
  const dateFixResult = await getAllUtms(_id.toString()) as Array<UTM> | null;

  if (dateFixResult) {
    const result = await Promise.all(
      dateFixResult.map(async (doc: UTM) => {
        const clickCount = await getShortUrl(doc.shortId);

        return {
          _id : doc._id.toString(),
          url : doc.url,
          campaignId : doc.campaignId,
          campaignName : doc.campaignName,
          medium : doc.medium,
          source : doc.source,
          content : doc.content,
          term : doc.term,
          memo : doc.memo,
          fullUrl : doc.fullUrl,
          shortenUrl : doc.shortenUrl,
          clickCount,
          createdAt : new Date(doc.createdAt).toISOString().slice(0, 10),
        };
      })
    );
    ctx.response.body = responseBody(true, '', result);
  } else {
    ctx.response.body = responseBody(false, '', []);
  }

  await next();
}

// UTM 생성하기.
export async function createUtmCtr (ctx: Context, next: Next) {
  const { _id } = ctx.state.user;
  const utmsData = ctx.request.body.data;

  // map 이 전부 끝날때까지 대기.
  const result = await Promise.all(
    utmsData.map(async (doc: UTM) => {
      return await createUTM(_id.toString(), doc);
    })
  );

  ctx.response.body = responseBody(true, '', result);
  await next();
}

// UTM 삭제하기.
export async function deleteUtmCtr (ctx: Context, next: Next) {
  const deleteData = ctx.request.body.data;
  await Promise.all(
    deleteData.map(async (doc: UTM) => {
      await deleteUtm(doc._id);
      await deleteShortUrl(doc.shortenUrl);
    })
  );

  ctx.response.body = responseBody(true, '', {});
  await next();
}

// UTM 메모 수정하기
export async function updateUtmMemoCtr (ctx: Context, next: Next) {
  const updateDoc = ctx.request.body.data;
  await updateMemo(updateDoc._id, updateDoc.memo);

  ctx.response.body = responseBody(true, '', {});
  await next();
}

// Excel file 추출하기.
export async function exportExcelFileCtr (ctx: Context, next: Next) {
  const { _id } = ctx.state.user;
  const checkDataId = ctx.request.body.data;
  const filename = `${_id.toString()}-${new Date(Date.now()).toISOString().slice(0, 10)}`;
  await createExcelFile(filename, checkDataId);
  ctx.response.set({ 'Content-Type' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  ctx.response.attachment(`./temp/${filename}.xlsx`);
  ctx.response.body = responseBody(true, '', `./temp/${filename}.xlsx`);

  // eslint-disable-next-line promise/prefer-await-to-callbacks
  fs.unlink(`./temp/${filename}.xlsx`, err => {
    if (err) {
      ctx.throw(err);
    }
  });
  await next();
}

// CSV file 추출하기.
export async function exportCSVFileCtr (ctx: Context, next: Next) {
  const { _id } = ctx.state.user;
  const checkDataId = ctx.request.body.data;
  const filename = `${_id.toString()}-csv-${new Date(Date.now()).toISOString().slice(0, 10)}`;
  const csvData = await createCSVFile(checkDataId);

  ctx.response.set({
    'Content-Type' : 'text/csv',
    'Content-Disposition' : `attachment; filename="${filename}.csv"`,
  });
  ctx.response.body = responseBody(true, '', csvData);
  await next();
}

// 외부 UTM 추가하기.
export async function getExternalUtmCtr (ctx: Context, next: Next) {
  const { _id } = ctx.state.user;
  const { url, createdAt, memo } = ctx.request.body.data;

  const doc = parseFullUrl(url, memo, createdAt);

  await createUTM(_id.toString(), doc);
  ctx.response.body = responseBody(true, '', {});
  await next();
}

// 외부 UTM 대량 추가하기.
export async function importExcelFile (ctx: Context, next: Next) {
  const { files } = ctx.request.files!;
  const { _id } = ctx.state.user;

  const parseData: Array<any> = parseExcel(files);

  // 빈값으로 줄 때
  for (let i = 0; i < parseData.length; i++) {
    if (parseData[i].created_at === undefined) {
      parseData[i].created_at = new Date(Date.now()).toISOString().slice(0, 10);
    }
    if (parseData[i].utm_memo === undefined) {
      parseData[i].utm_memo = '-';
    }
  }

  // 템플릿 유효한지 확인
  const hasKey = parseData.some(data => {
    return Object.keys(data).some(key => !['created_at', 'utm_memo', 'full_url'].includes(key)
    );
  });

  if (hasKey) {
    ctx.response.body = responseBody(false, 'Includes invalid column key', {});
    return next();
  }

  const dateRegexp = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12]\d|3[01])$/;
  const urlRegexp = /^https:\/\//;

  // 입력값 유효한지 확인
  for (let i = 0; i < parseData.length; i++) {
    if (!dateRegexp.test(parseData[i].created_at)) {
      ctx.response.body = responseBody(false, `invalid date value "${parseData[i].created_at}"`, {});
      return next();
    }
    if (!urlRegexp.test(parseData[i].full_url)) {
      ctx.response.body = responseBody(false, `invalid date value "${parseData[i].created_at}"`, {});
      return next();
    }
  }

  const processDataForDB = parseData.map(doc => {
    return parseFullUrl(doc.full_url, doc.utm_memo, doc.created_at);
  });

  const pendingResult = processDataForDB.map(async doc => {
    await createUTM(_id.toString(), doc);
    return true;
  });

  const hasError = pendingResult.some(item => !item);

  if (hasError) {
    ctx.response.body = responseBody(false, 'few data failed', {});
  } else {
    ctx.response.body = responseBody(true, '', {});
  }
  await next();
}