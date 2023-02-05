import router from "../route/index.js";
import { wsRouter } from "../route/index.js";
import { gameService } from "../services/game-service.js";
import { tokenService } from "../services/token-service.js";

export class GameController {
  async startGame(req, res, next) {
    const { refreshToken } = req.cookies;
    const userData = tokenService.validateRefreshToken(refreshToken);
    const userToConnect = await gameService.startGame(refreshToken);
    let wsId;

    if (userToConnect) {
      wsId = userToConnect._id;
      await router.ws(`/${wsId}`, gameService.initSocket);
      console.log(wsRouter);
      return res.status(200).json(wsId);

    } else {
      wsId = userData.id;
      await router.ws(`/${wsId}`, gameService.initSocket);
      console.log(wsRouter);
      return res.status(200).json(wsId);
    }


  }
}

export const gameController = new GameController();
