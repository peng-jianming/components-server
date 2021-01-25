import mongoose from "../config/mongoConfig";

const userSchema = new mongoose.Schema({
  user_name: String,
  password: String,
  email: String
});

export default mongoose.model("user", userSchema);
