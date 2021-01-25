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
    const captchas = await Captcha.find({
      uuid: ctx.request.body.uuid,
      captcha_code: ctx.request.body.captcha_code,
      email: ctx.request.body.email,
    });
    if (captchas.length !== 0) {
      const users = await User.find({ email: ctx.request.body.email });
      if (users.length === 0) {
        const user = new User(ctx.request.body);
        const result = await user.save();
        ctx.body = {
          code: 0,
          data: result,
        };
      } else {
        ctx.throw(422, "这个邮箱已经注册过了!,请找回或者选择新的邮箱重新注册");
      }
    } else {
      ctx.throw(422, "验证码错误");
    }
  }

  async retrieve(ctx) {
    ctx.verifyParams({
      email: {
        type: "string",
        required: true,
      },
    });
    const user = await User.findOne(ctx.request.body);
    if (user) {
      const retrieveHtml = `您的Components密码为:${user.password}`;
      sendMail("Components密码找回", ctx.request.body.email, retrieveHtml);
      ctx.body = {
        code: 0,
        data: "success",
      };
    } else {
      ctx.throw(422, "该邮箱还未注册过账号");
    }
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
    const captcha = await Captcha.findOne({
      uuid: ctx.request.body.uuid,
      captcha_code: ctx.request.body.captcha_code.toLocaleLowerCase(),
    });
    if (captcha) {
      const user = await User.findOne({
        email: ctx.request.body.email,
        password: ctx.request.body.password,
      });
      if (user) {
        const data = josnwebtoken.sign(
          {
            user_name: user.user_name,
            id: user._id,
            email: user.email,
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
      } else {
        ctx.throw(422, "邮箱或者密码错误!");
      }
    } else {
      ctx.throw(422, "验证码错误!");
    }
  }
}

export default new PublicController();
