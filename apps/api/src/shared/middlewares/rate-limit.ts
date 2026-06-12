import rateLimit from "express-rate-limit";

// Stricter limiter for sensitive auth endpoints (login, OTP, password reset) to
// slow brute-force attempts — tighter than the global /api limiter.
// Counts ALL requests (not just failures): the OTP-generating endpoints
// (resend-verification, forgot-password) return a generic success even when
// they send an email, so skipping successes would make them an unlimited
// email-bomb / OTP-minting vector. A real flow uses only a handful of requests,
// so 30 / 15 min / IP never blocks legit users while capping abuse.
// This limiter is shared across the auth routes (per-IP counter).
// NOTE: in-memory store; for multi-instance deployments swap in a Redis store.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later.",
  },
});
