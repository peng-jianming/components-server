import KoaRouter from "koa-router";
import publicController from "../controller/public.js";

const router = new KoaRouter();

router.get("/captcha", publicController.getCaptcha);

export default router;
