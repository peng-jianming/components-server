import { pickBy } from 'lodash';
import path from 'path';
import User from '../model/user';
import Message from '../model/message';

class UserController {
  async getAllUser(ctx) {
    const limit = parseInt(ctx.query.limit) || 10;
    const page = ((parseInt(ctx.query.page) || 1) - 1) * limit;
    const query = pickBy({
      ...ctx.query,
      limit: undefined,
      page: undefined
    });
    const users = await User.find({
      ...query,
      $nor: [{ user_name: 'admin' }]
    })
      .skip(page)
      .limit(limit);
    const count = await User.find({
      ...query,
      $nor: [{ user_name: 'admin' }]
    }).countDocuments();
    ctx.body = {
      code: 0,
      data: {
        total: count,
        data: users
      }
    };
  }

  async patchAllUser(ctx) {
    await User.findByIdAndUpdate(ctx.request.body._id, ctx.request.body);
    ctx.body = {
      code: 0,
      data: 'success'
    };
  }

  async getUser(ctx) {
    const user = await User.findOne({ _id: ctx.state.user.id });
    ctx.body = {
      code: 0,
      data: user
    };
  }

  uploadAvatar(ctx) {
    const file = ctx.request.files.file;
    const basename = path.basename(file.path);
    ctx.body = {
      code: 0,
      data: {
        url: `${
          process.env.NODE_ENV === 'production'
            ? 'http://8.129.90.25:3000/upload'
            : 'http://localhost:3000/upload'
        }/${basename}`
      }
    };
  }

  async updateUser(ctx) {
    ctx.verifyParams({
      email: {
        type: 'string',
        required: true
      },
      avatar: {
        type: 'string',
        required: true
      }
    });
    const result = await User.updateOne(
      { _id: ctx.state.user.id },
      ctx.request.body
    );
    ctx.body = {
      code: 0,
      data: result
    };
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
    const user = await User.findOne({
      _id: ctx.state.user.id,
      password: ctx.request.body.old_password
    });
    if (!user) ctx.throw(400, '原密码错误');
    const result = await User.findByIdAndUpdate(ctx.state.user.id, {
      password: ctx.request.body.new_password
    });
    ctx.body = {
      code: 0,
      data: result
    };
  }

  async searchUserName(ctx) {
    const users = await User.find({
      user_name: new RegExp(`^${ctx.query.q}`)
    });
    ctx.body = {
      code: 0,
      data: users
    };
  }

  async getMessage(ctx) {
    const limit = parseInt(ctx.query.limit) || 10;
    const page = ((parseInt(ctx.query.page) || 1) - 1) * limit;
    const messages = await Message.find({
      reception_people: { $in: ctx.state.user.user_name }
    })
      .limit(limit)
      .skip(page)
      .sort('-create_time');
    const count = await Message.find({
      reception_people: { $in: ctx.state.user.user_name }
    }).countDocuments();
    ctx.body = {
      code: 0,
      data: {
        total: count,
        data: messages
      }
    };
  }

  async postMessage(ctx) {
    await Message.findByIdAndUpdate(ctx.request.body.id, {
      isRead: true
    });
    ctx.body = {
      code: 0,
      data: 'success'
    };
  }
}

export default new UserController();
