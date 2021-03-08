import svgCaptcha from 'svg-captcha';
import User from '../model/user';
import Captcha from '../model/captcha';
import Permission from '../model/permission';
import sendMail from '../config/mailConfig';
import josnwebtoken from 'jsonwebtoken';
import { Boolean } from '../dependencies/enums/Boolean';

class PublicController {
  async getCaptcha(ctx) {
    ctx.verifyParams({
      uuid: {
        type: 'string',
        required: true
      }
    });
    const captcha = svgCaptcha.create({
      width: 220,
      height: 40,
      ignoreChars: '0o1i',
      background: '#f2f2f2',
      noise: Math.floor(Math.random() * 5)
    });
    await Captcha.deleteMany({
      uuid: ctx.request.query.uuid
    });
    const result = new Captcha({
      ...ctx.request.query,
      captcha_code: captcha.text.toLocaleLowerCase()
    });
    await result.save();
    ctx.body = {
      code: 0,
      data: captcha.data
    };
  }

  async sendCaptchaEmail(ctx) {
    ctx.verifyParams({
      email: {
        type: 'string',
        required: true
      },
      uuid: {
        type: 'string',
        required: true
      }
    });
    const captchaText = svgCaptcha.create().text;
    await Captcha.deleteMany({
      uuid: ctx.request.body.uuid
    });
    const captcha = new Captcha({
      ...ctx.request.body,
      captcha_code: captchaText
    });
    await captcha.save();
    const registerHtml = `您注册账号的验证码为<b>${captchaText}</b>,验证码将在五分钟后过期!`;
    sendMail('Components注册账号激活', ctx.request.body.email, registerHtml);
    ctx.body = {
      code: 0,
      data: 'success'
    };
  }

  async register(ctx) {
    ctx.verifyParams({
      user_name: {
        type: 'string',
        required: true
      },
      password: {
        type: 'string',
        required: true
      },
      email: {
        type: 'string',
        required: true
      },
      captcha_code: {
        type: 'string',
        required: true
      },
      uuid: {
        type: 'string',
        required: true
      }
    });
    const captchaOne = await Captcha.findOne({
      uuid: ctx.request.body.uuid
    });
    if (!captchaOne) ctx.throw(400, '验证码已经过期了,请重新获取!');
    if (
      captchaOne.email !== ctx.request.body.email ||
      captchaOne.captcha_code.toLocaleLowerCase() !==
        ctx.request.body.captcha_code
    )
      ctx.throw(400, '输入验证码错误!');
    const userOne = await User.findOne({ email: ctx.request.body.email });
    if (userOne)
      ctx.throw(400, '这个邮箱已经注册过了,请找回或者选择新的邮箱重新注册!');
    const userTwo = await User.findOne({
      user_name: ctx.request.body.user_name
    });
    if (userTwo) ctx.throw(400, '这个用户名已经注册过了,请更改!');
    // 默认给目前所有权限
    const permission = await Permission.find();
    const codes = [];
    permission.forEach(({ children }) => {
      children.forEach(({ children }) => {
        children.forEach((item) => codes.push(item.permission_code));
      });
    });
    const user = new User({
      ...ctx.request.body,
      permission: codes
    });
    const result = await user.save();
    ctx.body = {
      code: 0,
      data: result
    };
  }

  async retrieve(ctx) {
    ctx.verifyParams({
      email: {
        type: 'string',
        required: true
      }
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) ctx.throw(400, '该邮箱还未注册过账号');
    const retrieveHtml = `您的Components密码为:${user.password}`;
    sendMail('Components密码找回', ctx.request.body.email, retrieveHtml);
    ctx.body = {
      code: 0,
      data: 'success'
    };
  }

  async login(ctx) {
    ctx.verifyParams({
      email: {
        type: 'string',
        required: true
      },
      password: {
        type: 'string',
        required: true
      },
      captcha_code: {
        type: 'string',
        required: true
      },
      uuid: {
        type: 'string',
        required: true
      }
    });
    const captchaOne = await Captcha.findOne({
      uuid: ctx.request.body.uuid
    });
    if (!captchaOne) ctx.throw(400, '验证码已经过期了!');
    if (
      captchaOne.captcha_code !==
      ctx.request.body.captcha_code.toLocaleLowerCase()
    )
      ctx.throw(400, '输入验证码错误!');
    const user = await User.findOne({
      email: ctx.request.body.email,
      password: ctx.request.body.password
    });
    if (!user) ctx.throw(400, '邮箱或者密码错误!');
    if (user.activate === Boolean.FALSE)
      ctx.throw(400, '账号未激活,请激活后使用!');
    const data = josnwebtoken.sign(
      {
        user_name: user.user_name,
        id: user._id,
        email: user.email,
        post: user.post
      },
      'shared-secret',
      { expiresIn: '1d' }
    );
    ctx.body = {
      code: 0,
      data: {
        token: data
      }
    };
  }
}

export default new PublicController();
