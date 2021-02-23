import mongoose from 'mongoose';

mongoose.connect('mongodb://pjm:123456@8.129.90.25:27017/components', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

mongoose.connection.on('connected', () => {
  console.log('数据库连接成功!');
  // https://mongoosejs.com/docs/deprecations.html#findandmodify
  mongoose.set('useFindAndModify', false);
});

mongoose.connection.on('error', (err) => {
  console.log('数据库连接异常!', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('数据库断开连接!');
});

export default mongoose;
