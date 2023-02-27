import { ModelUser } from "../../models/user-model.js";

export async function sendDisconnect(ws, msg) {
  console.log("disconnect");

  msg.user = ws.game.nickName;
  msg.method = "disconnect";

  const currGame = this.games[ws.game.gameId];

  if (currGame) {
    const gameIsEnded = currGame.every((wss) => {
      return wss.readyState === 3;
    });

    if (gameIsEnded) {
      console.log("Удаление игры");
      for (let ws of currGame) {
        await ModelUser.updateOne(
          { name: ws.game.nickName },
          { isWaitingGame: false, gameId: "" }
        );
      }

      delete this.games[ws.game.gameId];
    }
  }

  this.connectBroadcast(ws, msg);
}
