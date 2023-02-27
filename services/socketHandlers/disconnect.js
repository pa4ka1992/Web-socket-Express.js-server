export function sendDisconnect(ws, msg) {
  console.log("disconnect");

  msg.user = ws.game.nickName;
  msg.method = "disconnect"

  this.connectBroadcast(ws, msg);
}
