import svgCaptcha from "svg-captcha";

class PublicController {
  async getCaptcha(ctx) {
    const captcha = svgCaptcha.create();
    ctx.body = {
      code: 0,
      data: captcha.data,
    };
  }
}

export default new PublicController();
