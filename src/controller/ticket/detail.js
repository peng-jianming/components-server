import Ticket from '../../model/ticket'

class TicketDetailController {
  async ticketDetail(ctx) {
    const ticket = await Ticket.findOne({ticket_id: ctx.request.params.id});
    ctx.body = {
      code: 0,
      data: ticket
    }
  }

}

export default new TicketDetailController();