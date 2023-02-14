import { ModelUser } from "../models/user-model.js";

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
    console.log("connect");
    const { gameId, user } = msg;

    ws.gameId = gameId;
    ws.nickName = user.name;

    const game = this.games[gameId];

    if (!game) {
      msg.isAbleShoot = ws.isAbleShoot = true;
      msg.isGameFinded = ws.isGameFinded = false;

      this.games[gameId] = [ws];
    } else if (game.length < 2) {
      const isReconnect = this.reconnect(game, ws, user, msg);

      if (!isReconnect) {
        msg.isAbleShoot = ws.isAbleShoot = false;

        msg.opponentName = this.games[gameId][0].nickName;
        game.push(ws);

        msg.isGameFinded = true;
        game.forEach((wss) => {
          wss.isGameFinded = true;
        });
      }
    } else if (game.length === 2) {
      this.reconnect(game, ws, user, msg);
    }

    this.connectBroadcast(ws, msg);
  }

  readyHandler(ws, msg) {
    msg.method = "start";
    console.log("ready");
    const { user, field, gameId } = msg;
    const game = this.games[gameId];

    game.forEach((wss) => {
      if (wss.nickName === user.name) {
        wss.field = field;
      }
    });

    if (game.length === 2) {
      msg.isStarted = game.every((ws) => ws.field);
    } else {
      msg.isStarted = false;
    }

    this.connectBroadcast(ws, msg);
  }

  shootHandler(ws, msg) {
    // msg.method = "shoot";
    console.log("shoot");
    // const { gameId, user, coordinates } = msg;
    // const game = this.games[gameId];
    // const damageUser = game.find((ws) => ws.nickName !== user.name);

    // if (isGameOver) {
    //   msg.method = "gameOver";
    // }

    this.connectBroadcast(ws, msg);
  }

  async exitHandler(ws, msg) {
    console.log("exit");
    const { gameId } = msg;

    for (const ws of this.games[gameId]) {
      await ModelUser.updateOne({ name: ws.nickName }, { gameId: "" });
    }

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

  reconnect(game, ws, user, msg) {
    const replaceUser = game.findIndex((wss) => wss.nickName === user.name);
    const opponent = game.findIndex((wss) => wss.nickName !== user.name);
    if (replaceUser >= 0) {
      msg.isAbleShoot = ws.isAbleShoot = game[replaceUser].isAbleShoot;
      msg.isGameFinded = ws.isGameFinded = game[replaceUser].isGameFinded;
      if (game[replaceUser].field) {
        msg.field = ws.field = game[replaceUser].field;
      }
      game[replaceUser] = ws;

      if (opponent >= 0) {
        msg.opponentName = game[opponent].nickName;
        if (game[opponent].field) {
          msg.opponentField = game[opponent].field;
        }
      }

      console.log("reconnect");
      return true;
    }
    return false;
  }
}
