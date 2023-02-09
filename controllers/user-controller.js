import { userService } from "../services/user-service.js";
import { validationResult } from "express-validator";

export class UserController {
  setCookies(userData, res, state) {
    const message =
      state === "login"
        ? "Пользователь с таким именем уже существует"
        : "Пользователь не авторизован";

    if (userData) {
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 3600000000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      return res.status(200).json(userData);
    } else {
      return res.status(401).json({ message: message });
    }
  }

  async logIn(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(403).json({ message: "Имя слишком короткое" });
      }

      const { name } = req.body;
      const userData = await userService.logIn(name);

      return this.setCookies(userData, res, "login");
    } catch (error) {
      return res.status(403).json({ message: "Ошибка авторизации" });
    }
  }

  async logOut(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logOut(refreshToken);

      res.clearCookie(refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res.status(200).json({ message: "Пользователь удален" });
    } catch (error) {
      return res.status(403).json({ message: "Ошибка выхода" });
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);

      return this.setCookies(userData, res, "refresh");
    } catch (error) {
      return res.status(403).json({ message: "Ошибка обновления токена" });
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: "Ошибка получения пользователей" });
    }
  }
}

export const userController = new UserController();
