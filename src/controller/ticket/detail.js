import { uniq } from 'lodash';
import Ticket from '../../model/ticket';
import User from '../../model/user';
import { Post } from '../../dependencies/enums/Post';
import { TicketStatus } from '../../dependencies/enums/TicketStatus';
import { ChatType } from '../../dependencies/enums/ChatType';
import { Action } from '../../dependencies/enums/Action';
import sw from '../../config/websocketConfig';
import Message from '../../model/message';

class TicketDetailController {
  async ticketDetail(ctx) {
    const ticket = await Ticket.findOne({
      ticket_id: ctx.request.params.id
    })
      .populate('chat_record.user')
      .select('-chat_record');
    ctx.body = {
      code: 0,
      data: ticket
    };
  }

  async handleTicket(ctx) {
    const ticket = await Ticket.findOne({
      ticket_id: ctx.request.body.ticket_id
    });
    if (
      (ctx.request.body.action === Action.TRANSFER ||
        ctx.request.body.ticket_status) &&
      ctx.request.body.current_ticket_status !== ticket.ticket_status
    )
      ctx.throw(400, '该工单当前状态已被改变,请刷新页面后重试');
    let title =
      ctx.request.body.action === Action.TRANSFER &&
      !(
        ticket.ticket_status === TicketStatus.PENDING &&
        ctx.request.body.post !== Post.RESPONSIBLE
      )
        ? `工单${ticket.ticket_id},转单了`
        : `工单${ticket.ticket_id},状态变更了`;
    let content = '';
    // 转单,只有待处理和处理中有转单选项
    if (ctx.request.body.action === Action.TRANSFER) {
      const user = await User.findOne({
        user_name: ctx.request.body.processor
      });
      if (user.post !== ctx.request.body.post)
        ctx.throw(400, '所转处理人和岗位不匹配');
      // 待处理转给运维特殊处理,进入下一状态处理中
      if (
        ticket.ticket_status === TicketStatus.PENDING &&
        ctx.request.body.post !== Post.RESPONSIBLE
      ) {
        ticket.ticket_status = TicketStatus.IN_HAND;
        ticket.chat_record.push({
          current_handler: ctx.state.user.user_name,
          type: ChatType.TRANFER,
          text: `由${ctx.state.user.user_name}转单给了${ctx.request.body.processor},进入处理中状态`
        });
        content = `工单状态由待处理变更为处理中,当前处理人为${ctx.request.body.processor}`;
      } else {
        // 转客户代表需要修改工单客户代表
        if (ctx.request.body.post === Post.RESPONSIBLE)
          ticket.responsible = ctx.request.body.processor;
        ticket.chat_record.push({
          current_handler: ctx.state.user.user_name,
          type: ChatType.TRANFER,
          text: `由${ctx.state.user.user_name}转单给了${ctx.request.body.processor}`
        });
        content = `处理人由${ctx.state.user.user_name}变更为${ctx.request.body.processor}`;
      }
      ticket.current_handler = ctx.request.body.processor;
      ticket.post = ctx.request.body.post;
    } else {
      // 处理工单
      switch (ctx.request.body.ticket_status) {
        // 申请结单
        case TicketStatus.CLOSE_APPLICATION:
          ticket.current_handler = ticket.responsible;
          ticket.post = Post.RESPONSIBLE;
          ticket.ticket_status = TicketStatus.CLOSE_APPLICATION;
          ticket.chat_record.push({
            current_handler: ctx.state.user.user_name,
            type: ChatType.CLOSE_APPLICATION,
            text: `申请接单,该工单进入申请结单状态,待客户代表处理`
          });
          content = `工单状态由待处理变更为申请接单,当前处理人为${ticket.current_handler}`;
          break;
        // 同意结单
        case TicketStatus.AGREE_CLOSE:
          ticket.ticket_status = TicketStatus.CLOSED;
          ticket.chat_record.push({
            current_handler: ctx.state.user.user_name,
            type: ChatType.AGREE_CLOSE,
            text: `同意结单,该工单已结单`
          });
          content = `工单状态由申请接单变更为已结单`;
          break;
        // 拒绝结单
        case TicketStatus.REFUSE_CLOSE:
          ticket.ticket_status = TicketStatus.IN_HAND;
          // eslint-disable-next-line no-case-declarations
          const closeApplication = ticket.chat_record.filter(
            ({ type }) => type === ChatType.CLOSE_APPLICATION
          );
          ticket.current_handler =
            closeApplication[closeApplication.length - 1].current_handler;
          ticket.post = Post.OPERATION;
          ticket.chat_record.push({
            current_handler: ctx.state.user.user_name,
            type: ChatType.REFUSE_CLOSE,
            text: `拒绝结单,该工单退回处理中`
          });
          content = `工单状态由申请接单变更为处理中,当前处理人为${ticket.current_handler}`;
          break;
        // 已结单
        case TicketStatus.CLOSED:
          ticket.ticket_status = TicketStatus.CLOSED;
          ticket.chat_record.push({
            current_handler: ctx.state.user.user_name,
            type: ChatType.CLOSED,
            text: `客户代表已结单`
          });
          content = `工单状态由客户代表直接更改已结单`;
          break;
        default:
          if (ctx.request.body.copy_to_people) {
            title = `工单${ticket.ticket_id},有内容抄送给您`;
            content = `${ctx.state.user.user_name}在更新工单时,抄送给您`;
          }
      }
    }
    ctx.request.body.reply &&
      ticket.chat_record.push({
        current_handler: ctx.state.user.user_name,
        type: ChatType.CHAT,
        user: ctx.state.user.id,
        text: ctx.request.body.reply
      });
    await ticket.save();
    // 没有赋值content(只有处理中聊天,并没有抄送人的情况下),则不通知
    if (content) {
      const copyToPeople = ctx.request.body.copy_to_people
        ? ctx.request.body.copy_to_people.split(';')
        : [];
      const peoples = uniq([
        ...copyToPeople,
        ticket.current_handler,
        ticket.responsible
      ]).filter(
        // 抄送人包含自己就抄送给自己,否则不给自己抄送
        (name) =>
          copyToPeople.includes(ctx.state.user.user_name) ||
          name !== ctx.state.user.user_name
      );
      const message = new Message({
        title,
        content,
        reception_people: peoples
      });
      await message.save();
      // 抄送通知
      peoples.forEach((userName) =>
        sw.send(userName, {
          event: 'tip',
          data: {
            id: message._id,
            title,
            content
          }
        })
      );
    }
    ctx.body = {
      code: 0,
      data: 'success'
    };
    sw.broadcast(ticket.ticket_id, ctx.state.user.id);
  }

  async getTicketChatRecord(ctx) {
    const ticket = await Ticket.findOne({
      ticket_id: ctx.request.params.id
    }).populate('chat_record.user');
    ctx.body = {
      code: 0,
      data: ticket.chat_record
    };
  }
}

export default new TicketDetailController();
