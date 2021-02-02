import KorRouter from "koa-router";

const router = new KorRouter({ prefix: "/workbench/api" });

router.get("/test", (ctx) => {
  ctx.body = {
    code: 0,
    data: "success",
  };
});

export default router;
