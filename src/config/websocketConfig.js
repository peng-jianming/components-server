import WebSocket  from 'ws';
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
    this.wss = new WebSocket.WebSocketServer(this.config);
    this.wss.on('connection', (ws) => {
      // 连接成功,开启心跳检测
      ws.isAlive = true;
      this.heartbeat(ws);

      ws.on('message', (msg) => this.message(ws, msg));
      ws.on('close', () => this.close(ws, this.wss));
    });
  }

  message(ws, msg) {
    const data = JSON.parse(msg);
    const event = {
      // 身份验证完后添加返回验证信息,并添加对应用户信息到ws上
      auth: (params) => {
        try {
          const auth = jwt.verify(params.token, 'shared-secret');
          if (auth) {
            ws.user = auth;
            ws.roomId = params.roomId;
          }
        } catch (err) {
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

  send(userName, message) {
    // 排除掉是多人的客户端,根据对应用户名发送消息
    [...this.wss.clients]
      .filter((client) => !client.roomId)
      .forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          client.user.user_name === userName
        ) {
          client.send(JSON.stringify(message));
        }
      });
  }

  broadcast(roomId, userId) {
    // 广播对应房间号的,排除自己
    [...this.wss.clients]
      .filter((client) => client.roomId)
      .forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          client.roomId === roomId
          // userId !== client.user.id
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
