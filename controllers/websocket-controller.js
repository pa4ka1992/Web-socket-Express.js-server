export class WsController {
  constructor(service) {
    this.service = service;
  }

  webSocketHandler(ws, req) {
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
      }
    });
  }
}
