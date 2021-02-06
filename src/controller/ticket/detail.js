import Ticket from "../../model/ticket";
import User from "../../model/user";
import { Post } from "../../dependencies/enums/Post";
import { TicketStatus } from "../../dependencies/enums/TicketStatus";
import { ChatType } from "../../dependencies/enums/ChatType";
import { Action } from "../../dependencies/enums/Action";
import sw from "../../config/websocketConfig";

class TicketDetailController {
  async ticketDetail(ctx) {
    const ticket = await Ticket.findOne({
      ticket_id: ctx.request.params.id,
    }).populate("chat_record.user");
    ctx.body = {
      code: 0,
      data: ticket,
    };
  }

  async handleTicket(ctx) {
    const ticket = await Ticket.findOne({
      ticket_id: ctx.request.body.ticket_id,
    });
    // 转单,只有待处理和处理中有转单选项
    if (ctx.request.body.action === Action.TRANSFER) {
      const user = await User.findOne({
        user_name: ctx.request.body.processor,
      });
      if (user.post !== ctx.request.body.post)
        ctx.throw(422, "所转处理人和岗位不匹配");
      // 待处理转给运维特殊处理,进入下一状态处理中
      if (
        ticket.ticket_status === TicketStatus.PENDING &&
        ctx.request.body.post !== Post.RESPONSIBLE
      ) {
        ticket.ticket_status = TicketStatus.IN_HAND;
        ticket.chat_record.push({
          current_handler: ctx.state.user.user_name,
          type: ChatType.TRANFER,
          text: `由${ctx.state.user.user_name}转单给了${ctx.request.body.processor},进入处理中状态`,
        });
      } else {
        // 转客户代表需要修改工单客户代表
        if (ctx.request.body.post === Post.RESPONSIBLE)
          ticket.responsible = ctx.request.body.processor;
        ticket.chat_record.push({
          current_handler: ctx.state.user.user_name,
          type: ChatType.TRANFER,
          text: `由${ctx.state.user.user_name}转单给了${ctx.request.body.processor}`,
        });
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
            text: `申请接单,该工单进入申请结单状态,待客户代表处理`,
          });
          sw.send(ticket.responsible, "更新更新");
          break;
        // 同意结单
        case TicketStatus.AGREE_CLOSE:
          ticket.ticket_status = TicketStatus.CLOSED;
          ticket.chat_record.push({
            current_handler: ctx.state.user.user_name,
            type: ChatType.AGREE_CLOSE,
            text: `同意结单,该工单已结单`,
          });
          break;
        // 拒绝结单
        case TicketStatus.REFUSE_CLOSE:
          ticket.ticket_status = TicketStatus.IN_HAND;
          const closeApplication = ticket.chat_record.filter(
            ({ type }) => type === ChatType.CLOSE_APPLICATION
          );
          ticket.current_handler =
            closeApplication[closeApplication.length - 1].current_handler;
          ticket.post = Post.OPERATION;
          ticket.chat_record.push({
            current_handler: ctx.state.user.user_name,
            type: ChatType.REFUSE_CLOSE,
            text: `拒绝结单,该工单退回处理中`,
          });
          break;
        // 已结单
        case TicketStatus.CLOSED:
          ticket.chat_record.push({
            current_handler: ctx.state.user.user_name,
            type: ChatType.CLOSED,
            text: `客户代表已结单`,
          });
      }
    }
    ctx.request.body.reply &&
      ticket.chat_record.push({
        current_handler: ctx.state.user.user_name,
        type: ChatType.CHAT,
        user: ctx.state.user.id,
        text: ctx.request.body.reply,
      });
    await ticket.save();
    ctx.body = {
      code: 0,
      data: "success",
    };
    sw.broadcast(ticket.ticket_id, ctx.state.user.id);
  }
}

export default new TicketDetailController();
