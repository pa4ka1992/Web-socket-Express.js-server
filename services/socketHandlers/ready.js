export function sendReady(ws, msg) {
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
