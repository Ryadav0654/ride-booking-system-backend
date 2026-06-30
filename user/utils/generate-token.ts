import jwt from "jsonwebtoken";
import { config } from "../config/env";

export const generateAccessToken = (sub: string, email: string) => {
  const accessToken = jwt.sign(
    {
      sub,
      email,
    },
    config.accessTokenSecret,
    { expiresIn: "1d" }
  );

  return accessToken;
};

export const generateRefreshToken = (sub: string, email: string) => {
  const refreshToken = jwt.sign(
    {
      sub,
      email,
    },
    config.refreshTokenSecret,
    { expiresIn: "7d" }
  );

  return refreshToken;
};
