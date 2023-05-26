import Router from '@koa/router';
import { Context } from 'koa';
import { authentication } from '../util/auth.module';
import {
  createUtmController,
  deleteUtmController, exportCSVFileController, exportExcelFileController,
  getAllUtmsController, getExternalUtmController,
} from './utm.controller';

const router = new Router<{}, Context>();

export const utmRouter = router
  .use(authentication)
  .get('UTM 전체 조회', '/', getAllUtmsController)
  .post('UTM 생성', '/', createUtmController)
  .post('UTM 삭제', '/delete', deleteUtmController)
  .post('UTM Excel 추출', '/excel', exportExcelFileController)
  .post('UTM CSV 추출', '/csv', exportCSVFileController)
  .post('외부 UTM 추가', '/external', getExternalUtmController);
