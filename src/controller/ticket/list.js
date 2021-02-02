import { pickBy } from 'lodash'
import Ticket from '../../model/ticket'
import { Post } from '../../dependencies/enums/Post'

class TicketListController {
  // 创建工单
  async createTicket (ctx) {
    // ctx.verifyParams({
    //
    // })
    // 抄送人传过来的是字符串,需要自己分割查询
    // const users = await Promise.all(
    //   ctx.request.body.copy_to_people.split(";").map((name) => {
    //     return User.findOne({ user_name: name });
    //   })
    // );
    if (ctx.state.user.post !== Post.RESPONSIBLE)
      ctx.throw(413, '只有客户代表才能建单');
    const ticket = new Ticket({
      ...ctx.request.body,
      create_name: ctx.state.user.user_name,
      current_handler: ctx.state.user.user_name,
      responsible: ctx.state.user.user_name,
      operators: ctx.state.user.user_name,
      post: ctx.state.user.post
    })
    const result = await ticket.save()
    ctx.body = {
      code: 0,
      data: result
    }
  }

  // 获取工单列表
  async ticketList (ctx) {
    const limit = parseInt(ctx.query.limit) || 10
    const page = ((parseInt(ctx.query.page) || 1) - 1) * limit
    const query = pickBy({
      ...ctx.query,
      problem_heppen_start_time: ctx.query.problem_heppen_start_time && {
        $gt: new Date(ctx.query.problem_heppen_start_time)
      },
      problem_heppen_end_time: ctx.query.problem_heppen_end_time && {
        $lt: new Date(ctx.query.problem_heppen_end_time)
      },
      limit: undefined,
      page: undefined,
      'problem_heppen_time[]': undefined
    })
    const list = await Ticket.find(query).limit(limit).skip(page)
    const count = await Ticket.find(query).count()
    ctx.body = {
      code: 0,
      data: {
        total: count,
        data: list
      }
    }
  }
}

export default new TicketListController()
