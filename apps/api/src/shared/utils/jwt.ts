import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";

const accessExpiry = env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"];
const refreshExpiry = env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"];

/**
 * Which front-end app a session belongs to. Tokens are bound to one audience so
 * a session minted for the public storefront can't act on the seller/admin apps
 * (and vice-versa), even though all three share one API + one user identity.
 */
export type Audience = "web" | "seller" | "admin";
export const AUDIENCES: Audience[] = ["web", "seller", "admin"];

export const generateAccessToken = (userId: string, scope: Audience): string =>
  jwt.sign({ userId, scope }, env.JWT_ACCESS_SECRET, { expiresIn: accessExpiry });

export const generateRefreshToken = (userId: string, scope: Audience): string =>
  jwt.sign({ userId, scope }, env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiry });

export const verifyAccessToken = (token: string): { userId: string; scope?: Audience } =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; scope?: Audience };

export const verifyRefreshToken = (token: string): { userId: string; scope?: Audience } =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; scope?: Audience };
