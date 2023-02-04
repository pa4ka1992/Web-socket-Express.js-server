class GameService {
  async startGame(refreshToken) {
    const userData = tokenService.validateRefreshToken(refreshToken);
    const users = await this.getUsers();
    const opponent = users.find((user) => !!user.isWaitingGame);

    if (opponent) {
      await ModelUser.updateOne(
        { _id: opponent._id },
        { isWaitingGame: false }
      );
    } else {
      await ModelUser.updateOne({ _id: userData.id }, { isWaitingGame: true });
    }

    return opponent;
  }

  initSocket(ws, req) {
    console.log("вебсокет");
  }
}

export const gameService = new GameService();
