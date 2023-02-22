import { tokenService } from "../services/token-service.js";
import { userService } from "./user-service.js";
import { ModelUser } from "../models/user-model.js";

class GameService {
  async startGame(refreshToken) {
    const userData = tokenService.validateRefreshToken(refreshToken);
    const users = await userService.getUsers();

    const reconnectUser = users.find((user) => {
      return userData.id === user._id.toString() && !!user.gameId;
    });

    if (reconnectUser) {
      return {
        gameId: reconnectUser.gameId,
        user: { id: userData.id, name: userData.name },
      };
    }

    const opponent = users.find((user) => user.isWaitingGame);
    let gameId;

    if (opponent) {
      console.log('opponent');
      gameId = opponent.gameId;

      await ModelUser.updateOne(
        { _id: opponent._id },
        { isWaitingGame: false }
      );

      await ModelUser.updateOne({ _id: userData.id }, { gameId: gameId });
    } else {
      console.log('me');
      gameId = userData.id;

      await ModelUser.updateOne(
        { _id: userData.id },
        { isWaitingGame: true, gameId: userData.id }
      );
    }

    console.log({
      gameId: gameId,
      user: { id: userData.id, name: userData.name },
    });

    return {
      gameId: gameId,
      user: { id: userData.id, name: userData.name },
    };
  }
}

export const gameService = new GameService();
