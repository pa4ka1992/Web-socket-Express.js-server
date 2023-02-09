export class WsController {
  constructor(wsInstance) {
    this.wsInstance = wsInstance;
    this.games = {};
    this.info = wsInstance.getWss();
  }

  webSocketHandler(ws, req) {
    ws.on("message", (msg) => {
      msg = JSON.parse(msg.toString());

      switch (msg.method) {
        case "connection":
          this.connectHandler(ws, msg);
          break;

        case "ready":
          this.readyHandler(ws, msg);
          break;

        case "shoot":
          this.shootHandler(ws, msg);
          break;

        case "exit":
          this.exitHandler(ws, msg);
          break;
      }
    });
  }

  connectHandler(ws, msg) {
    const { gameId, user } = msg;

    ws.gameId = gameId;
    ws.nickName = user.name;

    const game = this.games[gameId];

    if (!game) {
      ws.isAbleShoot = true;
      this.games[gameId] = [ws];

      msg.isGameFinded = false;
      msg.isAbleShoot = true;
    } else if (game.length < 2) {
      const replaceUser = game.findIndex((ws) => ws.nickName === user.name);
      if (replaceUser >= 0) {
        game[replaceUser] = ws;
        ws.isAbleShoot = true;
        msg.isAbleShoot = true;
        msg.isGameFinded = false;
      } else {
        ws.isAbleShoot = false;
        msg.isAbleShoot = false;
        msg.isGameFinded = true;
        game.push(ws);
      }
    } else if (game.length === 2) {
      const replaceUser = game.findIndex((ws) => ws.nickName === user.name);
      if (replaceUser >= 0) {
        ws.isAbleShoot = game[replaceUser].isAbleShoot;
        ws.isGameFinded = game[replaceUser].isGameFinded;
        game[replaceUser] = ws;
      }
    }

    console.log(msg);

    this.connectBroadcast(ws, msg);
  }

  readyHandler(ws, msg) {
    const { user, field, gameId } = msg;
    const game = this.games[gameId];

    game.forEach((ws) => {
      if (ws.nickname === user.name) {
        ws.field = field.flat();
      }
    });

    const isStarted = game.every((ws) => ws.field);

    msg.isStarted = isStarted;
    msg.method = "start";

    this.connectBroadcast(ws, msg);
  }

  shootHandler(ws, msg) {
    const { gameId, user, coordinates } = msg;
    const game = this.games[gameId];
    const damageUser = game.find((ws) => ws.nickName !== user.name);

    damageUser.field = damageUser.field.filter((cell) => cell !== coordinates);

    if (game.some((ws) => ws.field.length)) {
      msg.method = "gameOver";
    }

    this.connectBroadcast(ws, msg);
  }

  exitHandler(ws, msg) {
    const { gameId } = msg;
    delete this.games[gameId];
    this.connectBroadcast(ws, msg);
  }

  connectBroadcast(ws, msg) {
    const { gameId } = msg;

    this.info.clients.forEach((client) => {
      if (client.gameId === gameId) {
        client.send(JSON.stringify(msg));
      }
    });
  }
}
