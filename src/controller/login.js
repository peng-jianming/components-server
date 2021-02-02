import svgCaptcha from "svg-captcha";
import User from "../model/user";
import Captcha from "../model/captcha";
import sendMail from "../config/mailConfig";
import josnwebtoken from "jsonwebtoken";

class PublicController {
  async getCaptcha(ctx) {
    ctx.verifyParams({
      uuid: {
        type: "string",
        required: true,
      },
    });
    const captcha = svgCaptcha.create({
      width: 220,
      height: 40,
      ignoreChars: "0o1i",
      background: "#f2f2f2",
      noise: Math.floor(Math.random() * 5),
    });
    await Captcha.deleteMany({
      uuid: ctx.request.query.uuid,
    });
    const result = new Captcha({
      ...ctx.request.query,
      captcha_code: captcha.text.toLocaleLowerCase(),
    });
    await result.save();
    ctx.body = {
      code: 0,
      data: captcha.data,
    };
  }

  async sendCaptchaEmail(ctx) {
    ctx.verifyParams({
      email: {
        type: "string",
        required: true,
      },
      uuid: {
        type: "string",
        required: true,
      },
    });
    const captchaText = svgCaptcha.create().text;
    await Captcha.deleteMany({
      uuid: ctx.request.body.uuid,
    });
    const captcha = new Captcha({
      ...ctx.request.body,
      captcha_code: captchaText,
    });
    await captcha.save();
    const registerHtml = `您注册账号的验证码为<b>${captchaText}</b>,验证码将在五分钟后过期!`;
    sendMail("Components注册账号激活", ctx.request.body.email, registerHtml);
    ctx.body = {
      code: 0,
      data: "success",
    };
  }

  async register(ctx) {
    ctx.verifyParams({
      user_name: {
        type: "string",
        required: true,
      },
      password: {
        type: "string",
        required: true,
      },
      email: {
        type: "string",
        required: true,
      },
      captcha_code: {
        type: "string",
        required: true,
      },
      uuid: {
        type: "string",
        required: true,
      },
    });
    const captcha_one = await Captcha.findOne({
      uuid: ctx.request.body.uuid,
    });
    if (!captcha_one) ctx.throw(422, "验证码已经过期了,请重新获取!");
    if (
      captcha_one.email !== ctx.request.body.email ||
      captcha_one.captcha_code !== ctx.request.body.captcha_code
    )
      ctx.throw(422, "输入验证码错误!");
    const user_one = await User.findOne({ email: ctx.request.body.email });
    if (user_one)
      ctx.throw(422, "这个邮箱已经注册过了,请找回或者选择新的邮箱重新注册!");
    const user_two = await User.findOne({
      user_name: ctx.request.body.user_name,
    });
    if (user_two) ctx.throw(422, "这个用户名已经注册过了,请更改!");
    const user = new User(ctx.request.body);
    const result = await user.save();
    ctx.body = {
      code: 0,
      data: result,
    };
  }

  async retrieve(ctx) {
    ctx.verifyParams({
      email: {
        type: "string",
        required: true,
      },
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) ctx.throw(422, "该邮箱还未注册过账号");
    const retrieveHtml = `您的Components密码为:${user.password}`;
    sendMail("Components密码找回", ctx.request.body.email, retrieveHtml);
    ctx.body = {
      code: 0,
      data: "success",
    };
  }

  async login(ctx) {
    ctx.verifyParams({
      email: {
        type: "string",
        required: true,
      },
      password: {
        type: "string",
        required: true,
      },
      captcha_code: {
        type: "string",
        required: true,
      },
      uuid: {
        type: "string",
        required: true,
      },
    });
    const captcha_one = await Captcha.findOne({
      uuid: ctx.request.body.uuid,
    });
    if (!captcha_one) ctx.throw(422, "验证码已经过期了!");
    if (captcha_one.captcha_code !== ctx.request.body.captcha_code)
      ctx.throw(422, "输入验证码错误!");
    const user = await User.findOne({
      email: ctx.request.body.email,
      password: ctx.request.body.password,
    });
    if (!user) ctx.throw(422, "邮箱或者密码错误!");
    const data = josnwebtoken.sign(
      {
        user_name: user.user_name,
        id: user._id,
        email: user.email,
        post: user.post,
      },
      "shared-secret",
      { expiresIn: "1d" }
    );
    ctx.body = {
      code: 0,
      data: {
        token: data,
      },
    };
  }
}

export default new PublicController();
