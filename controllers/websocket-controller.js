export class WsController {
  constructor(service) {
    this.service = service;
  }

  webSocketHandler(ws, req) {
    ws.game = {};
    ws.socketName = "";

    this.service.mailing(ws, "common");

    ws.on("message", (msg) => {
      msg = JSON.parse(msg.toString());

      switch (msg.method) {
        case "connection":
          this.service.connectHandler(ws, msg);
          break;

        case "ready":
          this.service.readyHandler(ws, msg);
          break;

        case "shoot":
          this.service.shootHandler(ws, msg);
          break;

        case "exit":
          this.service.exitHandler(ws, msg);
          break;

        case "chat":
          this.service.chatHandler(ws, msg);
          break;

        case "invite":
          this.service.inviteHandler(ws, msg);
          break;

        case "setsocketname":
          ws.socketName = msg.socketName;
          break;
      }
    });

    ws.on("close", () => {
      const msg = {};
      this.service.disconnectHandler(ws, msg);
    });
  }
}
