import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../../config/db.postgres";
import { ApiError } from "../utils/api-error";

export type AuthRequest = Request;

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError("No token provided", 401);
    }

    const { userId } = verifyAccessToken(header.split(" ")[1]);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true, store: { select: { id: true } } },
    });

    if (!user) throw new ApiError("User not found", 401);
    if (!user.isActive) throw new ApiError("Account is suspended", 403);

    req.user = {
      userId: user.id,
      role: user.role,
      storeId: user.store?.id,
    };

    next();
  } catch (err) {
    next(err);
  }
};