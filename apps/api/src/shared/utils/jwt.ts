import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export const generateAccessToken = (userId: string): string =>
  jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string): { userId: string } =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };

export const verifyRefreshToken = (token: string): { userId: string } =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };