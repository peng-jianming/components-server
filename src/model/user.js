import mongoose from "../config/mongoConfig";
import PostEnums, { Post } from "../dependencies/enums/Post";

const userSchema = new mongoose.Schema({
  __v: { type: Number, select: false },
  user_name: String,
  password: {
    type: String,
    select: false,
  },
  email: String,
  avatar: String,
  post: {
    type: Number,
    enum: PostEnums.map(({ id }) => id),
    default: Post.RESPONSIBLE,
  },
});

export default mongoose.model("User", userSchema);
