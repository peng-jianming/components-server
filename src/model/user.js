import mongoose from "../config/mongoConfig";

const userSchema = new mongoose.Schema({
  __v: { type: Number, select: false },
  user_name: String,
  password: {
    type: String,
    select: false,
  },
  email: String,
  avatar: String,
});

export default mongoose.model("user", userSchema);
