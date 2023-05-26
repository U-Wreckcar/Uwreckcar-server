import { Context, Next } from 'koa';
import {
  getAllUtms,
  getShortUrlClickCount,
  deleteShortUrl,
  createUtm,
  deleteUtm,
  createExcelFile,
  createCSVFile,
} from './utm.module';
import fs from 'fs';

// const __dirname = path.resolve();

export async function getAllUtmsController (ctx: Context, next: Next) {
  const { user_id } = ctx.state.user;
  const dateFixResult = await getAllUtms(user_id);
  const result = await Promise.all(
    dateFixResult.map(async (doc: Utms) => {
      const click_count = await getShortUrlClickCount(doc.short_id);
      return {
        utm_id : doc.utm_id,
        utm_url : doc.utm_url,
        utm_campaign_id : doc.utm_campaign_id,
        utm_campaign_name : doc.utm_campaign_name,
        utm_content : doc.utm_content,
        utm_term : doc.utm_term,
        utm_memo : doc.utm_memo,
        full_url : doc.full_url,
        shorten_url : doc.shorten_url,
        click_count,
        utm_medium_name : doc.user_utm_medium_id,
        utm_source_name : doc.user_utm_source_id,
        created_at_filter : new Date(doc.createdAt).toISOString().slice(0, 10),
      };
    })
  );
  ctx.status = 200;
  ctx.response.body = {
    success : true,
    data : result,
  };
  await next();
}

export async function createUtmController (ctx: Context, next: Next) {
  const { user_id } = ctx.state.user;
  const requirements = ['utm_source', 'utm_medium', 'utm_campaign_name', 'utm_url'];
  const utmsData = ctx.request.body.data;

  // requirements Validation.
  Object.keys(ctx.request.body).forEach(key => {
    if (!ctx.request.body[key] && requirements.includes(key)) {
      throw new Error(`Invalid ${key} value.`);
    }
  });

  // map 이 전부 끝날때까지 대기.
  const result = await Promise.all(
    utmsData.map(async (doc: Utms) => {
      try {
        const result = await createUtm(user_id, doc);
        // 성공 시 생성된 객체의 데이터 return
        return {
          utm_id : result.utm_id,
          full_url : result.full_url,
          shorten_url : result.shorten_url,
        };
      } catch (err) {
        console.error(err);
        // 실패 시 에러 객체 return
        return {
          error : true,
          message : err.message,
          stack : err.stack,
        };
      }
    })
  );

  // 에러 객체 여부 확인 후 존재하면 status 500 으로 response
  const hasError = result.some(item => item.error);

  ctx.assert(!hasError, 400, result);
  ctx.response.body = {
    success : true,
    data : result,
  };
  await next();
}

export async function deleteUtmController (ctx: Context, next: Next) {
  const deleteData = ctx.request.body.data;
  const result = await Promise.all(
    deleteData.map(async (utm: Utms) => {
      try {
        const result = await deleteUtm(utm.utm_id);
        await deleteShortUrl(utm.shorten_url);
        return result;
      } catch (err) {
        console.error(err);
        return {
          error : true,
          message : err.message,
          stack : err.stack,
        };
      }
    })
  );

  const hasError = result.some(item => item.error);

  ctx.assert(!hasError, 400, result);
  ctx.response.body = {
    success : true,
    data : 'delete successfully.',
  };
  await next();
}

export async function exportExcelFileController (ctx: Context, next: Next) {
  const { user_id } = ctx.state.user;
  const checkDataId = ctx.request.body.data;
  const filename = `${user_id}-${new Date(Date.now()).toISOString().slice(0, 10)}`;
  await createExcelFile(filename, checkDataId);
  ctx.response.attachment(`./temp/${filename}.xlsx`);
  ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  ctx.response.body = {
    success : true,
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

export async function exportCSVFileController (ctx: Context, next: Next) {
  const { user_id } = ctx.state.user;
  const checkDataId = ctx.request.body.data;
  const filename = `${user_id}-csv-${new Date(Date.now()).toISOString().slice(0, 10)}`;
  const csvData = await createCSVFile(checkDataId);
  ctx.response.set({
    'Content-Type' : 'text/csv',
    'Content-Disposition' : `attachment; filename="${filename}.csv"`,
  });
  ctx.response.body = csvData;
  await next();
}

export async function getExternalUtmController (ctx: Context, next: Next) {
  const { utm_url, created_at, memo } = ctx.request.body.data;
  const doc: { [k: string]: string } = {
    created_at,
    utm_memo : memo,
  };

  const [baseUrl, utmResources] = utm_url.split('?');
  doc['utm_url'] = baseUrl;
  const splitResources = utmResources.split('&');

  splitResources.forEach((data: string) => {
    const [utmType, utmValue] = data.split('=');
    if (utmType === 'utm_campaign') {
      doc['utm_campaign_name'] = utmValue;
    } else if (utmType.includes('utm')) {
      doc[utmType] = utmValue;
    }
  });

  const result = await createUtm(ctx.state.user.user_id, doc);
  ctx.response.body = {
    success : true,
    data : result,
  };
  await next();
}