export function sendDisconnect(ws, msg) {
  msg.user = ws.game.nickName;

  this.connectBroadcast(ws, msg);
}
