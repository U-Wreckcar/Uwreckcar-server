import { Context, Next } from 'koa';
import {
  getAllUtms,
  deleteShortUrl,
  createUTM,
  deleteUtm,
  createExcelFile,
  createCSVFile, getShortUrl,
} from './utm.module';
import fs from 'fs';
import { UTM } from './utm.types';

// 전체 UTM 가져오기.
export async function getAllUtmsCtr (ctx: Context, next: Next) {
  const { userId } = ctx.state.user;
  const dateFixResult = await getAllUtms(userId) as Array<UTM> | null;

  if (dateFixResult) {
    const result = await Promise.all(
      dateFixResult.map(async (doc: UTM) => {
        const clickCount = await getShortUrl(doc.shortId);

        return {
          _id : doc._id.toString(),
          url : doc.url,
          campaignId : doc.campaignId,
          campaignName : doc.campaignName,
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
    ctx.response.body = {
      result : { success : true, message : '' },
      data : result,
    };
  } else {
    ctx.response.body = {
      result : { success : false, message : '' },
      data : [],
    };
  }

  await next();
}

// UTM 생성하기.
export async function createUtmCtr (ctx: Context, next: Next) {
  const { userId } = ctx.state.user;
  const utmsData = ctx.request.body.data;

  // map 이 전부 끝날때까지 대기.
  const result = await Promise.all(
    utmsData.map(async (doc: UTM) => {
      return await createUTM(userId, doc);
    })
  );

  ctx.response.body = {
    result : { success : true, message : '' },
    data : result,
  };
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

  ctx.response.body = {
    result : { success : true, message : '' },
    data : {},
  };
  await next();
}

// Excel file 추출하기.
export async function exportExcelFileCtr (ctx: Context, next: Next) {
  const { userId } = ctx.state.user;
  const checkDataId = ctx.request.body.data;
  const filename = `${userId}-${new Date(Date.now()).toISOString().slice(0, 10)}`;
  await createExcelFile(filename, checkDataId);
  ctx.response.attachment(`./temp/${filename}.xlsx`);
  ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  ctx.response.body = {
    result : { success : true, message : '' },
    data : `./temp/${filename}.xlsx`,
  };
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
  const { userId } = ctx.state.user;
  const checkDataId = ctx.request.body.data;
  const filename = `${userId}-csv-${new Date(Date.now()).toISOString().slice(0, 10)}`;
  const csvData = await createCSVFile(checkDataId);
  ctx.response.set({
    'Content-Type' : 'text/csv',
    'Content-Disposition' : `attachment; filename="${filename}.csv"`,
  });
  ctx.response.body = {
    result : { success : true, message : '' },
    data : csvData,
  };
  await next();
}

// 외부 UTM 추가하기.
export async function getExternalUtmCtr (ctx: Context, next: Next) {
  const { userId } = ctx.state.user;
  const { url, createdAt, memo } = ctx.request.body.data;
  const doc: { [k: string]: string } = {
    createdAt,
    utm_memo : memo,
  };

  const [baseUrl, utmResources] = url.split('?');
  doc['url'] = baseUrl;
  const splitResources = utmResources.split('&');

  splitResources.forEach((data: string) => {
    const [utmType, utmValue] = data.split('=');
    if (utmType === 'utm_campaign') {
      doc['campaignName'] = utmValue;
    } else if (utmType.includes('utm_term')) {
      doc['term'] = utmValue;
    } else if (utmType.includes('utm_content')) {
      doc['content'] = utmValue;
    }
  });

  await createUTM(userId, doc);
  ctx.response.body = {
    result : { success : true, message : '' },
    data : {},
  };
  await next();
}