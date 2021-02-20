import mongoose from '../config/mongoConfig';

const permissionSchema = new mongoose.Schema({
  title: String,
  permission_code: String,
  description: String
});

// 让子节点和父节点拥有属性相同
permissionSchema.add({
  children: [permissionSchema]
});

export default mongoose.model('Permission', permissionSchema);
