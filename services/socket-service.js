import { ModelUser } from "../models/user-model.js";

export class SocketService {
  constructor(wsInstance) {
    this.wsInstance = wsInstance;
    this.games = {};
    this.info = wsInstance.getWss();
  }

  connectHandler(ws, msg) {
    console.log('connect');
    const { gameId, user } = msg;

    ws.gameId = gameId;
    ws.nickName = user.name;

    const game = this.games[gameId];

    if (!game) {
      console.log('connect new');
      this.messageApplier('isAbleShoot', true, msg, ws);
      this.messageApplier('isGameFinded', false, msg, ws);

      this.games[gameId] = [ws];
    }

    if (game && game.length === 1) {
      console.log('connect 1');
      const isReconnect = this.reconnect(game, ws, user, msg);

      if (!isReconnect) {
        this.messageApplier('isAbleShoot', false, msg, ws);

        msg.opponentName = this.games[gameId][0].nickName;
        game.push(ws);

        msg.isGameFinded = true;
        game.forEach((wss) => {
          wss.isGameFinded = true;
        });
      }
    }

    if (game && game.length === 2) {
      console.log('connect 2');
      this.reconnect(game, ws, user, msg);
    }

    this.connectBroadcast(ws, msg);
  }

  readyHandler(ws, msg) {
    console.log('ready');
    msg.method = "start";
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
    console.log('shoot');
    const { gameId, user, shoot } = msg;
    const game = this.games[gameId];
    const damageUser = game.find((wss) => wss.nickName !== user.name);

    const isDamaged = damageUser.field.shipsLocation.some((ship) => {
      const isHitted = ship.shipLocation.find((cell) => cell === shoot);

      if (isHitted) {
        this.messageApplier('isAbleShoot', true, msg, ws);
        ship.woundedCells.push(shoot);
      }
      return !!isHitted;
    });

    if (!isDamaged) {
      this.messageApplier('isAbleShoot', false, msg, ws);
      damageUser.misses.push(shoot);
    }

    const isGameOver = damageUser.field.shipsLocation.every(
      (ship) => ship.decks === ship.woundedCells
    );

    if (isGameOver) {
      msg.method = "gameover";
      msg.winner = user.name;
    }

    this.connectBroadcast(ws, msg);
  }

  async exitHandler(ws, msg) {
    console.log('exit');
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

  messageApplier(key, value, msg, wss) {
    msg[key] = wss[key] = value;
  }

  reconnect(game, ws, user, msg) {
    console.log('reconnect');
    let replaceUser;
    let replaceIndex;
    let opponent;

    game.forEach((wss, i) => {
      if (wss.nickName === user.name) {
        replaceUser = wss;
        replaceIndex = i;
      } else {
        opponent = wss;
      }
    });

    if (replaceUser) {
      this.messageApplier('isAbleShoot', replaceUser.isAbleShoot, msg, ws);
      this.messageApplier('isGameFinded', replaceUser.isGameFinded, msg, ws);

      if (replaceUser.field) {
        this.messageApplier('field', replaceUser.field, msg, ws);
      }
      game[replaceIndex] = ws;

      if (opponent) {
        msg.opponentName = opponent.nickName;
        if (opponent.field) {
          msg.opponentField = opponent.field;
        }
      }

      return true;
    }
    return false;
  }
}
