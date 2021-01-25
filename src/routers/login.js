import KoaRouter from "koa-router";
import publicController from "../controller/login.js";

const router = new KoaRouter({ prefix: "/login" });

router.get("/captcha", publicController.getCaptcha);

router.post("/sendCaptchaEmail", publicController.sendCaptchaEmail);

router.post("/register", publicController.register);

router.post("/retrieve", publicController.retrieve);

router.post("/login", publicController.login);

export default router;
