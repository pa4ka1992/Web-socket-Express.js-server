import router from "../route/index.js";
import { gameService } from "../services/game-service.js";

export class GameController {
  async startGame(req, res, next) {
    const { refreshToken } = req.cookies;
    const userToConnect = await gameService.startGame(refreshToken);
    let wsLink;

    if (userToConnect) {
      wsLink = `/game/:${userToConnect._id}`;
      router.ws(wsLink, gameService.initSocket);
    } else {
      wsLink = `/game/:${id}`;
      router.ws(wsLink, gameService.initSocket);
    }

    return res.status(200).json(wsLink);
  }
}

export const gameController = new GameController();
