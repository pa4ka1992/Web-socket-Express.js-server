import { ModelUser } from "../models/user-model.js";
import { tokenService } from "./token-service.js";

class UserService {
  async updateUser(user) {
    const resUser = {
      name: user.name,
      id: user._id,
    };
    const tokens = tokenService.generateTokens(resUser);

    await tokenService.saveToken(user._id, tokens.refreshToken);

    return { ...tokens, ...resUser };
  }

  async logIn(name) {
    const candidate = await ModelUser.findOne({ name });

    if (candidate) {
      return undefined;
    }

    const user = await ModelUser.create({ name });

    return this.updateUser(user);
  }

  async logOut(refreshToken) {
    const userData = tokenService.validateRefreshToken(refreshToken);
    const user = await ModelUser.deleteOne({ _id: userData.id });
    const token = await tokenService.removeToken(refreshToken);

    return { user, token };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      return undefined;
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenInDB = await tokenService.findToken(refreshToken);

    if (!userData || !tokenInDB) {
      return undefined;
    }

    const user = await ModelUser.findById(userData.id);

    return this.updateUser(user);
  }

  async getUsers() {
    const users = await ModelUser.find();
    return users;
  }
}

export const userService = new UserService();
