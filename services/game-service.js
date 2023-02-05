import { tokenService } from "../services/token-service.js";
import { userService } from "./user-service.js";
import { ModelUser } from "../models/user-model.js";

class GameService {
  async startGame(refreshToken) {
    const userData = tokenService.validateRefreshToken(refreshToken);
    const users = await userService.getUsers();
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
    console.log('asasdasdasdaasdasda');
  }
}

export const gameService = new GameService();
