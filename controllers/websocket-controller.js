export class WsController {
  constructor(wsInstance) {
    this.wsInstance = wsInstance;
    this.games = {};
    this.info = wsInstance.getWss();
  }

  webSocketHandler(ws, req) {
    ws.on("message", (msg) => {
      msg = JSON.parse(msg);

      switch (msg.method) {
        case "connection":
          this.connectHandler(ws, msg);
          break;

        case "ready":
          this.readyHandler(ws, msg);
          break;

        case "shot":
          this.shotHandler(ws, msg);
          break;

        case "gameOver":
          this.gameOverHandler(ws, msg);
          break;
      }
    });
  }

  connectHandler(ws, msg) {
    ws.userId = msg.userId;
    ws.gameId = msg.gameId;

    const game = this.games[msg.gameId];

    if (!game) {
      game = [ws];
    }

    if (game.length < 2) {
      game.push(ws);
      msg.startGame = true;
    }

    if (game.length === 2) {
      const replaceUser = game.findIndex((user) => user.userId === msg.userId);
      if (replaceUser >= 0) {
        game[replaceUser] = [ws];
      }
    }

    this.connectBroadcast(ws, msg);
  }

  connectBroadcast(ws, msg) {
    this.info.clients.forEach((client) => {
      if (client.gameId === msg.gameId) {
        client.send(JSON.stringify(msg));
      }
    });
  }
}
