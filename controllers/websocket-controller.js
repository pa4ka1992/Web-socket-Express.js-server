export class WsController {
  constructor(wsInstance) {
    this.wsInstance = wsInstance;
  }

  webSocketHandler(ws, req) {
    ws.on("message", (msg) => {
      msg = JSON.parse(msg);

      switch (msg.method) {
        case "connection":
          this.connectHandler(ws, msg);
          break;

        default:
          break;
      }
    });
  }

  connectHandler(ws, msg) {
    ws.id = msg.id;
    this.connectBroadcast(ws, msg);
  }

  connectBroadcast(ws, msg) {
    this.wsInstance.getWss().clients.forEach((client) => {
        if (client.id === msg.id) {
            client.send(`Подключение по ${msg.id}`);
        }
    });
  }
}
