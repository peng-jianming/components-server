import svgCaptcha from "svg-captcha";

class PublicController {
  async getCaptcha(ctx) {
    const captcha = svgCaptcha.create({
      width: 220,
      height: 40
    });
    ctx.body = {
      code: 0,
      data: captcha.data,
    };
  }
}

export default new PublicController();
