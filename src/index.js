import Koa from 'koa';
import json from 'koa-json';
import compose from 'koa-compose';
import koaStatic from 'koa-static';
import cors from '@koa/cors';
import path from 'path';
import koaBody from 'koa-body';
import router from './routers';
import error from 'koa-json-error';
import parameter from 'koa-parameter';

const app = new Koa();
console.log(process.env.NODE_ENV, 'test');
// koa-compose 集成中间件
const middleware = compose([
  koaStatic(path.join(__dirname, '../public')),
  cors(),
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.resolve(__dirname, '../public'),
      keepExtensions: true
    }
  }),
  parameter(app),
  json(),
  error({
    // 通过控制postFormat,来修改输出信息,stack是错误堆栈信息,在正式环境不应该返回,所以过滤掉
    // eslint-disable-next-line node/handle-callback-err
    postFormat: (err, { stack, ...other }) => {
      return process.env.NODE_ENV === 'production'
        ? other
        : { stack, ...other };
    }
  }),
  router()
]);

app.use(middleware);

app.listen(3000, () => {
  console.log('服务通过3000端口启动了');
});
