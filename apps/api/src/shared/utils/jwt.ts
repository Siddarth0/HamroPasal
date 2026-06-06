import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";

const accessExpiry = env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"];
const refreshExpiry = env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"];

export const generateAccessToken = (userId: string): string =>
  jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: accessExpiry });

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiry });

export const verifyAccessToken = (token: string): { userId: string } =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };

export const verifyRefreshToken = (token: string): { userId: string } =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
