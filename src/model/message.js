import mongoose from '../config/mongoConfig';

const messageSchema = new mongoose.Schema({
  title: String,
  content: String,
  isRead: {
    type: Boolean,
    default: false
  },
  reception_people: [{ type: String }],
  create_time: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Message', messageSchema);
