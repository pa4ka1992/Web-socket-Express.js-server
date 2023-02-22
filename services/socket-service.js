import { ModelUser } from "../models/user-model.js";

export class SocketService {
  constructor(wsInstance) {
    this.wsInstance = wsInstance;
    this.games = {};
    this.gameChats = {};
    this.commonChat = [];
    this.info = wsInstance.getWss();
  }

  connectHandler(ws, msg) {
    console.log("connect");
    const { gameId, user } = msg;

    ws.game.gameId = gameId;
    ws.game.nickName = user.name;

    const game = this.games[gameId];

    if (!game) {
      this.messageApplier("isAbleShoot", true, msg, ws);
      this.messageApplier("isGameFinded", false, msg, ws);

      this.games[gameId] = [ws];
      this.gameChats[gameId] = [];
    }

    if (game && game.length === 1) {
      const isReconnect = this.reconnect(game, ws, user, msg);

      if (!isReconnect) {
        this.messageApplier("isAbleShoot", false, msg, ws);

        msg.opponentName = game[0].nickName;
        game.push(ws);

        game.forEach((wss) => {
          this.messageApplier("isGameFinded", true, msg, wss);
        });
      }
    }

    if (game && game.length === 2) {
      this.reconnect(game, ws, user, msg);
    }

    this.connectBroadcast(ws, msg);
  }

  readyHandler(ws, msg) {
    console.log("ready");
    const { nickName, gameId } = ws.game;
    const { field } = msg;
    const game = this.games[gameId];

    game.forEach((wss) => {
      if (wss.game.nickName === nickName) {
        wss.game.field = field;
      }
    });

    if (game.length === 2) {
      msg.isStarted = game.every((ws) => ws.game.field);
    } else {
      msg.isStarted = false;
    }

    msg.user = ws.game.nickName;

    this.connectBroadcast(ws, msg);
  }

  shootHandler(ws, msg) {
    console.log("shoot");
    const { nickName, gameId } = ws.game;
    const { shoot } = msg;
    const game = this.games[gameId];
    const damageUser = game.find((wss) => wss.game.nickName !== nickName);

    const isDamaged = damageUser.game.field.ships.some((ship) => {
      const isHitted = ship.shipLocation.find((cell) => cell === shoot);

      if (isHitted) {
        this.messageApplier("isAbleShoot", true, msg, ws);
        ship.woundedCells.push(shoot);
      }
      return !!isHitted;
    });

    if (!isDamaged) {
      this.messageApplier("isAbleShoot", false, msg, ws);
      damageUser.game.field.misses.push(shoot);
    }

    const isGameOver = damageUser.game.field.ships.every(
      (ship) => ship.decks === ship.woundedCells.length
    );

    if (isGameOver) {
      console.log("gameover");
      msg.method = "gameover";
      msg.winner = nickName;
    }

    msg.user = ws.game.nickName;

    this.connectBroadcast(ws, msg);
  }

  async exitHandler(ws, msg) {
    const { gameId } = ws.game;

    for (const ws of this.games[gameId]) {
      await ModelUser.updateOne({ name: ws.game.nickName }, { gameId: "" });
    }

    delete this.games[gameId];
    this.connectBroadcast(ws, msg);
  }

  chatHandler(ws, msg) {
    console.log("chat");
    const { mail } = msg;
    if (msg.gameId) {
      this.gameChats[gameId].push(mail);
    } else {
      this.commonChat.push(mail);
    }

    this.connectBroadcast(ws, msg);
  }

  connectBroadcast(ws, msg) {
    const { gameId } = ws.game;

    this.info.clients.forEach((client) => {
      if (msg.method === "chat") {
        console.log('send mail');
        client.send(JSON.stringify(msg));
      }

      if (client.game.gameId === gameId) {
        client.send(JSON.stringify(msg));

        if (msg.method === "exit") {
          client.game = {};
        }
      }
    });
  }

  messageApplier(key, value, msg, wss) {
    msg[key] = wss.game[key] = value;
  }

  reconnect(game, ws, user, msg) {
    console.log("reconnect");
    let replaceUser;
    let replaceIndex;
    let opponent;

    game.forEach((wss, i) => {
      if (wss.game.nickName === user.name) {
        replaceUser = wss;
        replaceIndex = i;
      } else {
        opponent = wss;
      }
    });

    if (replaceUser) {
      this.messageApplier("isAbleShoot", replaceUser.game.isAbleShoot, msg, ws);
      this.messageApplier(
        "isGameFinded",
        replaceUser.game.isGameFinded,
        msg,
        ws
      );

      if (replaceUser.game.field) {
        this.messageApplier("field", replaceUser.game.field, msg, ws);
      }
      game[replaceIndex] = ws;

      if (opponent) {
        msg.opponentName = opponent.game.nickName;
        if (opponent.field) {
          msg.opponentField = opponent.game.field;
        }
      }

      return true;
    }
    return false;
  }
}
