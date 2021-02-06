import mongoose from "../config/mongoConfig";

const captchaSchema = new mongoose.Schema({
  uuid: String,
  captcha_code: String,
  email: String,
  // 设置TTL,5分钟后过期自动删除
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } },
});

export default mongoose.model("Captcha", captchaSchema);
