import rateLimit from "express-rate-limit";

// Stricter limiter for sensitive auth endpoints (login, OTP, password reset) to
// slow brute-force attempts — tighter than the global /api limiter.
// NOTE: in-memory store; for multi-instance deployments swap in a Redis store.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later.",
  },
});
