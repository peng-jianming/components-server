import { pickBy } from 'lodash';
import Ticket from '../../model/ticket';
import { ChatType } from '../../dependencies/enums/ChatType';
import { Post } from '../../dependencies/enums/Post';
import sw from '../../config/websocketConfig';
import Message from '../../model/message';

class TicketListController {
  // 创建工单
  async createTicket(ctx) {
    if (ctx.state.user.post !== Post.RESPONSIBLE)
      ctx.throw(413, '只有客户代表才能建单');
    const ticket = new Ticket({
      ...ctx.request.body,
      create_name: ctx.state.user.user_name,
      current_handler: ctx.state.user.user_name,
      responsible: ctx.state.user.user_name,
      operators: ctx.state.user.user_name,
      post: ctx.state.user.post,
      chat_record: [
        {
          text: `${ctx.state.user.user_name}创建了工单`
        },
        {
          user: ctx.state.user.id,
          current_handler: ctx.state.user.user_name,
          type: ChatType.CHAT,
          text: ctx.request.body.description
        }
      ]
    });
    const result = await ticket.save();
    if (ticket.copy_to_people) {
      const title = `工单${ticket.ticket_id}创建了`;
      const content = `${ctx.state.user.user_name}在创建工单时,抄送给您`;
      const copyToPeople = ticket.copy_to_people.split(';');
      const message = new Message({
        title,
        content,
        reception_people: copyToPeople
      });
      await message.save();
      copyToPeople.forEach((userName) =>
        sw.send(userName, {
          event: 'tip',
          data: {
            id: message._id,
            title,
            content: `${ctx.state.user.user_name}在创建工单时,抄送给您`
          }
        })
      );
    }
    ctx.body = {
      code: 0,
      data: result
    };
  }

  // 获取工单列表
  async ticketList(ctx) {
    const limit = parseInt(ctx.query.limit) || 10;
    const page = ((parseInt(ctx.query.page) || 1) - 1) * limit;
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
    });
    const list = await Ticket.find(query)
      .limit(limit)
      .skip(page)
      .sort('-create_time');
    const count = await Ticket.find(query).countDocuments();
    ctx.body = {
      code: 0,
      data: {
        total: count,
        data: list
      }
    };
  }

  async aboutMeTicket(ctx) {
    const limit = parseInt(ctx.query.limit) || 10;
    const page = ((parseInt(ctx.query.page) || 1) - 1) * limit;
    const query = pickBy({
      ...ctx.query,
      limit: undefined,
      page: undefined
    });
    const list = await Ticket.find(query)
      .or([
        {
          current_handler: ctx.state.user.user_name
        },
        {
          responsible: ctx.state.user.user_name
        }
      ])
      .limit(limit)
      .skip(page)
      .sort('-create_time');
    const count = await Ticket.find(query)
      .or([
        {
          current_handler: ctx.state.user.user_name
        },
        {
          responsible: ctx.state.user.user_name
        }
      ])
      .countDocuments();
    ctx.body = {
      code: 0,
      data: {
        total: count,
        data: list
      }
    };
  }
}

export default new TicketListController();
