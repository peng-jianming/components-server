import mongoose from '../config/mongoConfig';
import PostEnums, { Post } from '../dependencies/enums/Post';
import BooleanEnums, { Boolean } from '../dependencies/enums/Boolean';

const userSchema = new mongoose.Schema({
  __v: { type: Number, select: false },
  user_name: String,
  password: {
    type: String
  },
  email: String,
  avatar: {
    type: String,
    default: '//cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  },
  post: {
    type: Number,
    default: Post.OPERATION,
    enum: PostEnums.map(({ id }) => id)
  },
  activate: {
    type: Number,
    default: Boolean.TRUE,
    enum: BooleanEnums.map(({ id }) => id)
  },
  permission: [{ type: String }]
});

export default mongoose.model('User', userSchema);
