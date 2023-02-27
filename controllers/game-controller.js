import router from "../route/index.js";
import { wsRouter } from "../route/index.js";
import { gameService } from "../services/game-service.js";
import { tokenService } from "../services/token-service.js";

export class GameController {
  async startGame(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const { headers, body } = req;

      const response = await gameService.startGame(
        refreshToken,
        headers["with-friend"],
        body.friend
      );
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const gameController = new GameController();
