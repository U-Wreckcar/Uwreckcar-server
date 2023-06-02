import Router from '@koa/router';
import { Context } from 'koa';
import { authentication } from '../util/auth.module';
import {
  createUtmCtr,
  deleteUtmCtr, exportCSVFileCtr, exportExcelFileCtr,
  getAllUtmsCtr, getExternalUtmCtr, importExcelFile, updateUtmMemoCtr,
} from './utm.controller';

const router = new Router<{}, Context>();

export const utmRouter = router
  .use(authentication)
  .get('UTM 전체 조회', '/', getAllUtmsCtr)
  .post('UTM 생성', '/', createUtmCtr)
  .post('UTM 삭제', '/delete', deleteUtmCtr)
  .post('UTM Excel 추출', '/excel', exportExcelFileCtr)
  .post('UTM CSV 추출', '/csv', exportCSVFileCtr)
  .post('외부 UTM 추가', '/external', getExternalUtmCtr)
  .post('UTM 메모 수정하기', '/memo', updateUtmMemoCtr)
  .post('UTM 대량 추가하기', '/file-import', importExcelFile);
