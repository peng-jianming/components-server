import mongoose from "../config/mongoConfig";
import moment from "moment";
import TicketTypeEnums from "../dependencies/enums/TicketType";
import FeedbackEnums from "../dependencies/enums/Feedback";
import TicketStatusEnums, {
  TicketStatus,
} from "../dependencies/enums/TicketStatus";

const ticketSchema = new mongoose.Schema({
  __v: { select: false },
  ticket_id: {
    type: String,
    default: Date.now,
  },
  customer_name: String,
  phone_number: String,
  create_time: {
    type: Date,
    default: Date.now,
  },
  ticket_type: {
    type: Number,
    enum: TicketTypeEnums.map(({ id }) => id),
  },
  // 反馈渠道
  feedback_channel: {
    type: Number,
    enum: FeedbackEnums.map(({ id }) => id),
  },
  // 问题描述
  description: String,
  problem_heppen_time: [{ type: Date }],
  problem_heppen_start_time: Date,
  problem_heppen_end_time: Date,
  create_name: String,
  // 抄送人
  copy_to_people: String,
  ticket_status: {
    type: Number,
    enum: TicketStatusEnums.map((id) => id),
    default: TicketStatus.PENDING,
  },
  // 当前处理人
  current_handler: String,
  // 客户代表
  responsible: String,
  // 经手人
  operators: String,
  // 当前岗位
  post: Number,
});
export default mongoose.model("Ticket", ticketSchema);
