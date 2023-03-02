export function sendInvite(ws, msg) {
  if (!msg.isFinded) {
    let isExist = false;

    this.info.clients.forEach((client) => {
      if (client.socketName === msg.friend) {
        isExist = true;
      }
    });

    if (!isExist) {
      msg.isFinded = false;

      ws.send(JSON.stringify(msg));
      return;
    }

    msg.isFinded = true;
  }

  this.connectBroadcast(ws, msg);
}
