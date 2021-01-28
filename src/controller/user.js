import path from 'path';
import User from "../model/user";

class UserController {
  async getUser(ctx) {
    const user = await User.findOne({ _id: ctx.state.user.id });
    if (user) {
      ctx.body = {
        code: 0,
        data: user,
      };
    }
  }

  uploadAvatar(ctx) {
    const file = ctx.request.files.file;
    const basename = path.basename(file.path);
    ctx.body = {
      code: 0,
      data: { url: `${process.env.NODE_ENV === 'development' ? ctx.origin : 'http://8.129.90.25:3000'}/upload/${basename}` }
    };
  }

  async updateUser(ctx) {
    ctx.verifyParams({
      user_name: {
        type: 'string',
        required: true
      },
      email: {
        type: 'string',
        required: true
      },
      avatar: {
        type: 'string',
        required: true
      },
    });
    const result = await User.updateOne({_id: ctx.state.user.id}, ctx.request.body);
    if (result.nModified) {
      ctx.body = {
        code: 0,
        data: 'success'
      }
    }
  }

  async changePassword(ctx) {
    ctx.verifyParams({
      old_password: {
        type: 'string',
        required: true
      },
      new_password: {
        type: 'string',
        required: true
      }
    });
    const result = await User.updateOne(({
      _id: ctx.state.user.id,
      password: ctx.request.body.old_password
    }), {
      password: ctx.request.body.new_password
    })
    if (result.nModified) {
      ctx.body = {
        code: 0,
        data: 'success'
      }
    }else {
      ctx.throw(422, '原密码错误')
    }
  }
}

export default new UserController();
