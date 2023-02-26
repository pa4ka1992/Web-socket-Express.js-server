export function sendChat(ws, msg) {
  console.log("chat");
  const { mail } = msg;
  const { chatName, gameId, date } = mail;
  const dateShort = date.slice(0, 15);

  if (chatName === "common") {
    if (!this.commonChat.length) {
      msg.mail.setDate = true;
      this.latestDate = dateShort;
    }

    if (this.latestDate !== dateShort) {
      msg.mail.setDate = true;
      this.latestDate = dateShort;
    }

    console.log("commonmessage", msg.mail);
    this.commonChat.push(msg.mail);
  }

  if (chatName === "game" && gameId) {
    const gameChat = this.gameChats[gameId];

    if (!gameChat.length) {
      msg.mail.setDate = true;
      this.latestDate = dateShort;
    }

    if (this.latestDate !== dateShort) {
      msg.mail.setDate = true;
      this.latestDate = dateShort;
    }

    console.log("gamemessage", msg.mail);
    gameChat.push(msg.mail);
  }

  this.connectBroadcast(ws, msg);
}
