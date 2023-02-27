export function sendInvite(ws, msg) {
  console.log("invite");

  msg.server = ws.socketName;

  this.connectBroadcast(ws, msg);
}
