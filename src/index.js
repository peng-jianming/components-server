import Koa from "koa";
import json from "koa-json";
import compose from "koa-compose";
import helmet from "helmet";
import koaStatic from "koa-static";
import cors from "@koa/cors";
import path from "path";
import koaBody from "koa-body";
import compress from "koa-compress";
import router from "./routers";
import error from "koa-json-error";
import parameter from "koa-parameter";

const app = new Koa();

// koa-compose 集成中间件
const middleware = compose([
  router(),
  koaBody(),
  json(),
  helmet(),
  koaStatic(path.resolve(__dirname, "../public")),
  cors(),
  parameter(app),
  error({
    // 通过控制postformat,来修改输出信息,stack是错误堆栈信息,在正式环境不应该返回,所以过滤掉
    postFormat: (err, { stack, ...other }) => {
      return process.env.NODE_ENV === "production"
        ? other
        : { stack, ...other };
    },
  }),
]);

app.use(middleware);

// 压缩传输数据,提高传输速度
if (process.env.NODE_ENV === "production") {
  app.use(compress());
}

app.listen(3000, () => {
  console.log("服务通过3000端口启动了");
});