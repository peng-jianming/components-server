import WebSocket from 'ws';
import fs from 'fs';
import https from 'https';
import jwt from 'jsonwebtoken';

class Socket {
  constructor(config) {
    this.config = {
      port: 8080,
      ...config
    };
    this.wss = {};
    this.init();
  }

  init() {
    const server = https.createServer({
      cert: fs.readFileSync(
        __dirname + '/httpsConfig/5163307_www.pengjianming.top.pem'
      ),
      key: fs.readFileSync(
        __dirname + '/httpsConfig/5163307_www.pengjianming.top.key'
      )
    });
    this.wss = new WebSocket.Server({ server });
    this.wss.on('connection', (ws) => {
      // 连接成功,开启心跳检测
      ws.isAlive = true;
      this.heartbeat(ws);

      ws.on('message', (msg) => this.message(ws, msg));
      ws.on('close', () => this.close(ws, this.wss));
    });
    server.listen(8080);
  }

  message(ws, msg) {
    const data = JSON.parse(msg);
    const event = {
      // 身份验证完后添加返回验证信息,并添加对应用户信息到ws上
      auth: (params) => {
        const auth = jwt.verify(params.token, 'shared-secret');
        if (auth) {
          ws.user = auth;
          ws.roomId = params.roomId;
        } else {
          ws.send(
            JSON.stringify({
              event: 'noAuth'
            })
          );
        }
      },
      // 收到心跳,证明还活着
      heartbeat: () => {
        ws.isAlive = true;
      }
    };
    event[data.event](data.message);
  }

  send(user_name, message) {
    // 排除掉是多人的客户端,根据对应用户名发送消息
    [...this.wss.clients]
      .filter((client) => !client.roomId)
      .forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          client.user.user_name === user_name
        ) {
          client.send(JSON.stringify(message));
        }
      });
  }

  broadcast(roomId, user_id) {
    // 广播对应房间号的,排除自己
    [...this.wss.clients]
      .filter((client) => client.roomId)
      .forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          client.roomId === roomId &&
          user_id !== client.user.id
        ) {
          client.send(JSON.stringify({ event: 'chat' }));
        }
      });
  }

  close(ws) {
    // 关闭连接时关闭对应的定时器
    clearInterval(ws.interval);
  }

  heartbeat(ws) {
    // 假设心跳停止,定时发送ping测试心跳,如果没有返回pong,则会关闭该websocket
    ws.interval = setInterval(() => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.send(
        JSON.stringify({
          event: 'heartbeat',
          message: 'ping'
        })
      );
    }, 30000);
  }
}

export default new Socket();
