import Permission from '../../model/permission';
import User from '../../model/user';

class PermissionController {
  async getPermission(ctx) {
    const permissions = await Permission.find();
    ctx.body = {
      code: 0,
      data: permissions
    };
  }

  async addPermission(ctx) {
    const permission = new Permission(ctx.request.body);
    await permission.save();
    ctx.body = {
      code: 0,
      data: 'success'
    };
  }

  async updatePermission(ctx) {
    await Permission.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    ctx.body = {
      code: 0,
      data: 'success'
    };
  }

  async deletePermission(ctx) {
    await Permission.findByIdAndDelete(ctx.params.id);
    ctx.body = {
      code: 0,
      data: 'success'
    };
  }

  async updateUserPermission(ctx) {
    await User.findByIdAndUpdate(ctx.params.userId, {
      permission: ctx.request.body.permission
    });
    ctx.body = {
      code: 0,
      body: 'success'
    };
  }
}

export default new PermissionController();
