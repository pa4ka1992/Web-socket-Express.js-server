import { Router } from "express";
import expressWs from "express-ws";
import { userController } from "../controllers/user-controller.js";
import { gameController } from "../controllers/game-controller.js";
import { body } from "express-validator";

const router = new Router();
export const wsRouter = expressWs(router);

router.post(
  "/login",
  body("name").isLength({ min: 3 }),
  userController.logIn.bind(userController)
);
router.delete("/logout", userController.logOut);
router.get("/refresh", userController.refreshToken.bind(userController));
router.get("/getusers", userController.getUsers);
router.get("/startgame", gameController.startGame);

export default router;
