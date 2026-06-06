import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Zod validation (v4 exposes `issues`, not `errors`)
  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    const message = errors
      .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
      .join(", ");
    res.status(400).json({ success: false, message, errors });
    return;
  }

  // Prisma unique constraint
  if ((err as any).code === "P2002") {
    res.status(409).json({ success: false, message: "Record already exists." });
    return;
  }
  // Prisma not found
  if ((err as any).code === "P2025") {
    res.status(404).json({ success: false, message: "Record not found." });
    return;
  }

  if (err.name === "ValidationError") {
    res.status(400).json({ success: false, message: err.message });
    return;
  }
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ success: false, message: "Invalid token." });
    return;
  }
  if (err.name === "TokenExpiredError") {
    res.status(401).json({ success: false, message: "Token expired." });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};