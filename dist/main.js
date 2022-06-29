!function(e){var t={};function a(r){if(t[r])return t[r].exports;var s=t[r]={i:r,l:!1,exports:{}};return e[r].call(s.exports,s,s.exports,a),s.l=!0,s.exports}a.m=e,a.c=t,a.d=function(e,t,r){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(a.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)a.d(r,s,function(t){return e[t]}.bind(null,s));return r},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a(a.s=20)}([function(e,t){e.exports=require("koa-router")},function(e,t){e.exports=require("lodash")},function(e,t){e.exports=require("mongoose")},function(e,t){e.exports=require("koa-jwt")},function(e,t){e.exports=require("path")},function(e,t){e.exports=require("jsonwebtoken")},function(e,t){e.exports=require("ws")},function(e,t){e.exports=require("svg-captcha")},function(e,t){e.exports=require("nodemailer")},function(e,t){e.exports=require("koa")},function(e,t){e.exports=require("koa-json")},function(e,t){e.exports=require("koa-compose")},function(e,t){e.exports=require("koa-static")},function(e,t){e.exports=require("@koa/cors")},function(e,t){e.exports=require("koa-body")},function(e,t){e.exports=require("koa-combine-routers")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("koa-json-error")},function(e,t){e.exports=require("koa-parameter")},function(e,t,a){"use strict";var r=a(15),s=a.n(r),n=a(0),o=a.n(n),i=a(7),c=a.n(i),d=a(2),u=a.n(d);u.a.connect("mongodb://pjm:123456@8.129.90.25:27017/components",{useNewUrlParser:!0,useUnifiedTopology:!0,useCreateIndex:!0}),u.a.connection.on("connected",()=>{console.log("数据库连接成功!"),u.a.set("useFindAndModify",!1)}),u.a.connection.on("error",e=>{console.log("数据库连接异常!",e)}),u.a.connection.on("disconnected",()=>{console.log("数据库断开连接!")});var p=u.a;const l=Object.freeze({RESPONSIBLE:1,OPERATION:2});const m=Object.freeze({TRUE:1,FALSE:2});const y=new p.Schema({__v:{type:Number,select:!1},user_name:String,password:{type:String},email:String,avatar:{type:String,default:"//cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png"},post:{type:Number,default:l.OPERATION,enum:[{id:1,value:"客户代表",name:"RESPONSIBLE"},{id:2,value:"运维",name:"OPERATION"}].map(({id:e})=>e)},activate:{type:Number,default:m.TRUE,enum:[{id:1,name:"TRUE",value:"是"},{id:2,name:"FALSE",value:"否"}].map(({id:e})=>e)},permission:[{type:String}]});var _=p.model("User",y);const h=new p.Schema({uuid:String,captcha_code:String,email:String,createdAt:{type:Date,default:Date.now,index:{expires:300}}});var b=p.model("Captcha",h);const f=new p.Schema({title:String,permission_code:String,description:String});f.add({children:[f]});var g=p.model("Permission",f),w=a(8),E=a.n(w);var q=async function(e,t,a){let r=E.a.createTransport({host:"smtp.qq.com",port:587,secure:!1,auth:{user:"728494186@qq.com",pass:"jirlfxetbqwkbehh"}}),s=await r.sendMail({from:'"Components项目" <728494186@qq.com>',to:t,subject:""+e,html:a});console.log("Message sent: %s",s.messageId),console.log("Preview URL: %s",E.a.getTestMessageUrl(s))},v=a(5),S=a.n(v);var O=new class{async getCaptcha(e){e.verifyParams({uuid:{type:"string",required:!0}});const t=c.a.create({width:220,height:40,ignoreChars:"0o1i",background:"#f2f2f2",noise:Math.floor(5*Math.random())});await b.deleteMany({uuid:e.request.query.uuid});const a=new b({...e.request.query,captcha_code:t.text.toLocaleLowerCase()});await a.save(),e.body={code:0,data:t.data}}async sendCaptchaEmail(e){e.verifyParams({email:{type:"string",required:!0},uuid:{type:"string",required:!0}});const t=c.a.create().text;await b.deleteMany({uuid:e.request.body.uuid});const a=new b({...e.request.body,captcha_code:t});await a.save();const r=`您注册账号的验证码为<b>${t}</b>,验证码将在五分钟后过期!`;q("Components注册账号激活",e.request.body.email,r),e.body={code:0,data:"success"}}async register(e){e.verifyParams({user_name:{type:"string",required:!0},password:{type:"string",required:!0},email:{type:"string",required:!0},captcha_code:{type:"string",required:!0},uuid:{type:"string",required:!0}});const t=await b.findOne({uuid:e.request.body.uuid});t||e.throw(400,"验证码已经过期了,请重新获取!"),t.email===e.request.body.email&&t.captcha_code.toLocaleLowerCase()===e.request.body.captcha_code||e.throw(400,"输入验证码错误!");await _.findOne({email:e.request.body.email})&&e.throw(400,"这个邮箱已经注册过了,请找回或者选择新的邮箱重新注册!");await _.findOne({user_name:e.request.body.user_name})&&e.throw(400,"这个用户名已经注册过了,请更改!");const a=await g.find(),r=[];a.forEach(({children:e})=>{e.forEach(({children:e})=>{e.forEach(e=>r.push(e.permission_code))})});const s=new _({...e.request.body,permission:r}),n=await s.save();e.body={code:0,data:n}}async retrieve(e){e.verifyParams({email:{type:"string",required:!0}});const t=await _.findOne(e.request.body);t||e.throw(400,"该邮箱还未注册过账号");const a="您的Components密码为:"+t.password;q("Components密码找回",e.request.body.email,a),e.body={code:0,data:"success"}}async login(e){e.verifyParams({email:{type:"string",required:!0},password:{type:"string",required:!0},captcha_code:{type:"string",required:!0},uuid:{type:"string",required:!0}});const t=await b.findOne({uuid:e.request.body.uuid});t||e.throw(400,"验证码已经过期了!"),t.captcha_code!==e.request.body.captcha_code.toLocaleLowerCase()&&e.throw(400,"输入验证码错误!");const a=await _.findOne({email:e.request.body.email,password:e.request.body.password});a||e.throw(400,"邮箱或者密码错误!"),a.activate===m.FALSE&&e.throw(400,"账号未激活,请激活后使用!");const r=S.a.sign({user_name:a.user_name,id:a._id,email:a.email,post:a.post},"shared-secret",{expiresIn:"1d"});e.body={code:0,data:{token:r}}}};const A=new o.a({prefix:"/api/login"});A.post("/",O.login),A.get("/captcha",O.getCaptcha),A.post("/sendCaptchaEmail",O.sendCaptchaEmail),A.post("/register",O.register),A.post("/retrieve",O.retrieve);var I=A,k=a(1);const N=Object.freeze({A:1,B:2,C:3});Object.freeze({QQ:1,WECHAT:2,OFFICIAL:3});const C=Object.freeze({PENDING:1,IN_HAND:2,CLOSE_APPLICATION:3,AGREE_CLOSE:4,REFUSE_CLOSE:5,CLOSED:6,DELETED:7});const P=Object.freeze({TRANFER:1,CHAT:2,IN_HAND:3,CLOSE_APPLICATION:4,AGREE_CLOSE:5,REFUSE_CLOSE:6,CLOSED:7,DELETED:8});const L=new p.Schema({__v:{select:!1},ticket_id:{type:String,default:Date.now},customer_name:String,phone_number:String,create_time:{type:Date,default:Date.now},ticket_type:{type:Number,enum:[{id:1,value:"A工单",name:"A"},{id:2,value:"B工单",name:"B"},{id:3,value:"C工单",name:"C"}].map(({id:e})=>e)},feedback_channel:{type:Number,enum:[{id:1,name:"QQ",value:"QQ"},{id:2,name:"WECHAT",value:"微信"},{id:3,name:"OFFICIAL",value:"官网自建"}].map(({id:e})=>e)},description:String,problem_heppen_time:[{type:Date}],problem_heppen_start_time:Date,problem_heppen_end_time:Date,create_name:String,copy_to_people:String,ticket_status:{type:Number,enum:[{id:1,name:"PENDING",value:"待处理"},{id:2,name:"IN_HAND",value:"处理中"},{id:3,name:"CLOSE_APPLICATION",value:"申请结单"},{id:4,name:"AGREE_CLOSE",value:"同意结单"},{id:5,name:"REFUSE_CLOSE",value:"拒绝结单"},{id:6,name:"CLOSED",value:"已结单"},{id:7,name:"DELETED",value:"已删除"}].map(({id:e})=>e),default:C.PENDING},current_handler:String,responsible:String,operators:String,post:Number,chat_record:[{user:{type:p.Schema.Types.ObjectId,ref:"User",default:"600fb0f2205465003081b582"},current_handler:String,type:{type:Number,enum:[{id:1,name:"TRANFER",value:"转单"},{id:2,name:"CHAT",value:"聊天"},{id:3,name:"IN_HAND",value:"处理中"},{id:4,name:"CLOSE_APPLICATION",value:"申请结单"},{id:5,name:"AGREE_CLOSE",value:"同意结单"},{id:6,name:"REFUSE_CLOSE",value:"拒绝结单"},{id:7,name:"CLOSED",value:"已结单"},{id:8,name:"DELETED",value:"已删除"}].map(({id:e})=>e)},text:String,time:{type:String,default:Date.now}}]});var T=p.model("Ticket",L),R=a(6),D=a.n(R),x=a(16);var U=new class{constructor(e){this.config={port:4444,...e},this.wss={},this.init()}init(){{const e=Object(x.createServer)();this.wss=new D.a.WebSocketServer({server:e}),e.listen(4444)}this.wss.on("connection",e=>{e.isAlive=!0,this.heartbeat(e),e.on("message",t=>this.message(e,t)),e.on("close",()=>this.close(e,this.wss))})}message(e,t){const a=JSON.parse(t);({auth:t=>{try{const a=S.a.verify(t.token,"shared-secret");a&&(e.user=a,e.roomId=t.roomId)}catch(t){e.send(JSON.stringify({event:"noAuth"}))}},heartbeat:()=>{e.isAlive=!0}})[a.event](a.message)}send(e,t){[...this.wss.clients].filter(e=>!e.roomId).forEach(a=>{a.readyState===D.a.OPEN&&a.user.user_name===e&&a.send(JSON.stringify(t))})}broadcast(e,t){[...this.wss.clients].filter(e=>e.roomId).forEach(t=>{t.readyState===D.a.OPEN&&t.roomId===e&&t.send(JSON.stringify({event:"chat"}))})}close(e){clearInterval(e.interval)}heartbeat(e){e.interval=setInterval(()=>{if(!1===e.isAlive)return e.terminate();e.isAlive=!1,e.send(JSON.stringify({event:"heartbeat",message:"ping"}))},3e4)}};const j=new p.Schema({title:String,content:String,isRead:{type:Boolean,default:!1},reception_people:[{type:String}],create_time:{type:Date,default:Date.now}});var F=p.model("Message",j);var B=new class{async createTicket(e){e.state.user.post!==l.RESPONSIBLE&&e.throw(403,"只有客户代表才能建单");const t=await _.findById(e.state.user.id);e.request.body.ticket_type!==N.A||t.permission.includes("CREATE_TICKET_CREATE_A")||e.throw(403,"您没有创建A类型工单的权限");const a=new T({...e.request.body,create_name:e.state.user.user_name,current_handler:e.state.user.user_name,responsible:e.state.user.user_name,operators:e.state.user.user_name,post:e.state.user.post,chat_record:[{text:e.state.user.user_name+"创建了工单"},{user:e.state.user.id,current_handler:e.state.user.user_name,type:P.CHAT,text:e.request.body.description}]}),r=await a.save();if(a.copy_to_people){const t=`工单${a.ticket_id}创建了`,r=e.state.user.user_name+"在创建工单时,抄送给您",s=a.copy_to_people.split(";"),n=new F({title:t,content:r,reception_people:s});await n.save(),s.forEach(a=>U.send(a,{event:"tip",data:{id:n._id,title:t,content:e.state.user.user_name+"在创建工单时,抄送给您"}}))}e.body={code:0,data:r}}async ticketList(e){const t=parseInt(e.query.limit)||10,a=((parseInt(e.query.page)||1)-1)*t,r=Object(k.pickBy)({...e.query,problem_heppen_start_time:e.query.problem_heppen_start_time&&{$gt:new Date(e.query.problem_heppen_start_time)},problem_heppen_end_time:e.query.problem_heppen_end_time&&{$lt:new Date(e.query.problem_heppen_end_time)},limit:void 0,page:void 0,"problem_heppen_time[]":void 0}),s=await T.find(r).limit(t).skip(a).sort("-create_time").select("-chat_record"),n=await T.find(r).countDocuments();e.body={code:0,data:{total:n,data:s}}}async aboutMeTicket(e){const t=parseInt(e.query.limit)||10,a=((parseInt(e.query.page)||1)-1)*t,r=Object(k.pickBy)({...e.query,limit:void 0,page:void 0}),s=await T.find(r).or([{current_handler:e.state.user.user_name},{responsible:e.state.user.user_name}]).limit(t).skip(a).sort("-create_time").select("-chat_record"),n=await T.find(r).or([{current_handler:e.state.user.user_name},{responsible:e.state.user.user_name}]).countDocuments();e.body={code:0,data:{total:n,data:s}}}},M=a(3),$=a.n(M);const H=new o.a({prefix:"/api/workbench"}),G=$()({secret:"shared-secret"});H.get("/me",G,B.aboutMeTicket);var z=H,Q=a(4),J=a.n(Q);var W=new class{async getAllUser(e){const t=parseInt(e.query.limit)||10,a=((parseInt(e.query.page)||1)-1)*t,r=Object(k.pickBy)({...e.query,limit:void 0,page:void 0}),s=await _.find({...r,$nor:[{user_name:"admin"}]}).skip(a).limit(t),n=await _.find({...r,$nor:[{user_name:"admin"}]}).countDocuments();e.body={code:0,data:{total:n,data:s}}}async patchAllUser(e){await _.findByIdAndUpdate(e.request.body._id,e.request.body),e.body={code:0,data:"success"}}async getUser(e){const t=await _.findOne({_id:e.state.user.id});e.body={code:0,data:t}}uploadAvatar(e){const t=e.request.files.file,a=J.a.basename(t.path);e.body={code:0,data:{url:"https://www.pengjianming.top/upload/"+a}}}async updateUser(e){e.verifyParams({email:{type:"string",required:!0},avatar:{type:"string",required:!0}});const t=await _.updateOne({_id:e.state.user.id},e.request.body);e.body={code:0,data:t}}async changePassword(e){e.verifyParams({old_password:{type:"string",required:!0},new_password:{type:"string",required:!0}});await _.findOne({_id:e.state.user.id,password:e.request.body.old_password})||e.throw(400,"原密码错误");const t=await _.findByIdAndUpdate(e.state.user.id,{password:e.request.body.new_password});e.body={code:0,data:t}}async searchUserName(e){const t=await _.find({user_name:new RegExp("^"+e.query.q)});e.body={code:0,data:t}}async getMessage(e){const t=parseInt(e.query.limit)||10,a=((parseInt(e.query.page)||1)-1)*t,r=await F.find({reception_people:{$in:e.state.user.user_name}}).limit(t).skip(a).sort("-create_time"),s=await F.find({reception_people:{$in:e.state.user.user_name}}).countDocuments();e.body={code:0,data:{total:s,data:r}}}async postMessage(e){await F.findByIdAndUpdate(e.request.body.id,{isRead:!0}),e.body={code:0,data:"success"}}};const K=new o.a({prefix:"/api/user"}),V=$()({secret:"shared-secret"});K.get("/",V,W.getUser),K.get("/all",V,W.getAllUser),K.patch("/all",V,W.patchAllUser),K.post("/avatar",W.uploadAvatar),K.put("/",V,W.updateUser),K.patch("/changePassword",V,W.changePassword),K.get("/search",W.searchUserName),K.get("/message",V,W.getMessage),K.patch("/message",V,W.postMessage);var X=K;const Y=Object.freeze({IN_HAND:1,TRANSFER:2});var Z=new class{async ticketDetail(e){const t=await T.findOne({ticket_id:e.request.params.id}).populate("chat_record.user").select("-chat_record");e.body={code:0,data:t}}async handleTicket(e){const t=await T.findOne({ticket_id:e.request.body.ticket_id});e.request.body.action!==Y.TRANSFER&&!e.request.body.ticket_status||e.request.body.current_ticket_status===t.ticket_status||e.throw(400,"该工单当前状态已被改变,请刷新页面后重试");let a=e.request.body.action!==Y.TRANSFER||t.ticket_status===C.PENDING&&e.request.body.post!==l.RESPONSIBLE?`工单${t.ticket_id},状态变更了`:`工单${t.ticket_id},转单了`,r="";if(e.request.body.action===Y.TRANSFER){(await _.findOne({user_name:e.request.body.processor})).post!==e.request.body.post&&e.throw(400,"所转处理人和岗位不匹配"),t.ticket_status===C.PENDING&&e.request.body.post!==l.RESPONSIBLE?(t.ticket_status=C.IN_HAND,t.chat_record.push({current_handler:e.state.user.user_name,type:P.TRANFER,text:`由${e.state.user.user_name}转单给了${e.request.body.processor},进入处理中状态`}),r="工单状态由待处理变更为处理中,当前处理人为"+e.request.body.processor):(e.request.body.post===l.RESPONSIBLE&&(t.responsible=e.request.body.processor),t.chat_record.push({current_handler:e.state.user.user_name,type:P.TRANFER,text:`由${e.state.user.user_name}转单给了${e.request.body.processor}`}),r=`处理人由${e.state.user.user_name}变更为${e.request.body.processor}`),t.current_handler=e.request.body.processor,t.post=e.request.body.post}else switch(e.request.body.ticket_status){case C.CLOSE_APPLICATION:t.current_handler=t.responsible,t.post=l.RESPONSIBLE,t.ticket_status=C.CLOSE_APPLICATION,t.chat_record.push({current_handler:e.state.user.user_name,type:P.CLOSE_APPLICATION,text:"申请接单,该工单进入申请结单状态,待客户代表处理"}),r="工单状态由待处理变更为申请接单,当前处理人为"+t.current_handler;break;case C.AGREE_CLOSE:t.ticket_status=C.CLOSED,t.chat_record.push({current_handler:e.state.user.user_name,type:P.AGREE_CLOSE,text:"同意结单,该工单已结单"}),r="工单状态由申请接单变更为已结单";break;case C.REFUSE_CLOSE:t.ticket_status=C.IN_HAND;const s=t.chat_record.filter(({type:e})=>e===P.CLOSE_APPLICATION);t.current_handler=s[s.length-1].current_handler,t.post=l.OPERATION,t.chat_record.push({current_handler:e.state.user.user_name,type:P.REFUSE_CLOSE,text:"拒绝结单,该工单退回处理中"}),r="工单状态由申请接单变更为处理中,当前处理人为"+t.current_handler;break;case C.CLOSED:t.ticket_status=C.CLOSED,t.chat_record.push({current_handler:e.state.user.user_name,type:P.CLOSED,text:"客户代表已结单"}),r="工单状态由客户代表直接更改已结单";break;default:e.request.body.copy_to_people&&(a=`工单${t.ticket_id},有内容抄送给您`,r=e.state.user.user_name+"在更新工单时,抄送给您")}if(e.request.body.reply&&t.chat_record.push({current_handler:e.state.user.user_name,type:P.CHAT,user:e.state.user.id,text:e.request.body.reply}),await t.save(),r){const s=e.request.body.copy_to_people?e.request.body.copy_to_people.split(";"):[],n=Object(k.uniq)([...s,t.current_handler,t.responsible]).filter(t=>s.includes(e.state.user.user_name)||t!==e.state.user.user_name),o=new F({title:a,content:r,reception_people:n});await o.save(),n.forEach(e=>U.send(e,{event:"tip",data:{id:o._id,title:a,content:r}}))}e.body={code:0,data:"success"},U.broadcast(t.ticket_id,e.state.user.id)}async getTicketChatRecord(e){const t=await T.findOne({ticket_id:e.request.params.id}).populate("chat_record.user");e.body={code:0,data:t.chat_record}}};const ee=$()({secret:"shared-secret"}),te=new o.a({prefix:"/api/ticket"});te.post("/create",ee,B.createTicket),te.get("/list",B.ticketList),te.get("/:id",Z.ticketDetail),te.post("/",ee,Z.handleTicket),te.get("/:id/chatRecord",ee,Z.getTicketChatRecord);var ae=te;var re=new class{async getPermission(e){const t=await g.find();e.body={code:0,data:t}}async addPermission(e){const t=new g(e.request.body);await t.save(),e.body={code:0,data:"success"}}async updatePermission(e){await g.findByIdAndUpdate(e.params.id,e.request.body),e.body={code:0,data:"success"}}async deletePermission(e){await g.findByIdAndDelete(e.params.id),e.body={code:0,data:"success"}}async updateUserPermission(e){await _.findByIdAndUpdate(e.params.userId,{permission:e.request.body.permission}),e.body={code:0,body:"success"}}};const se=new o.a({prefix:"/api/admin"});se.get("/permission",re.getPermission),se.post("/permission",re.addPermission),se.put("/permission/:id",re.updatePermission),se.delete("/permission/:id",re.deletePermission),se.patch("/permission/:userId",re.updateUserPermission);var ne=se;t.a=s()(I,z,X,ae,ne)},function(e,t,a){"use strict";a.r(t),function(e){var t=a(9),r=a.n(t),s=a(10),n=a.n(s),o=a(11),i=a.n(o),c=a(12),d=a.n(c),u=a(13),p=a.n(u),l=a(4),m=a.n(l),y=a(14),_=a.n(y),h=a(19),b=a(17),f=a.n(b),g=a(18),w=a.n(g);const E=new r.a,q=i()([d()(m.a.join(e,"../public")),p()(),_()({multipart:!0,formidable:{uploadDir:m.a.resolve(e,"../public/upload"),keepExtensions:!0}}),w()(E),n()(),f()({postFormat:(e,{stack:t,...a})=>a}),Object(h.a)()]);E.use(q),E.listen(3e3,()=>{console.log("服务通过3000端口启动了")})}.call(this,"src")}]);