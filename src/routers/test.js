import KoaRouter from "koa-router";
const router = new KoaRouter();

router.get("/hello", (ctx) => {
  ctx.body = "hello World";
});

export default router;
