const UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

/**
 * Parses a duration string like "15m", "7d", "30s", "1h" (or a bare number of
 * seconds) into seconds. Used to keep Redis TTLs in sync with JWT expiries.
 */
export const parseDurationToSeconds = (value: string): number => {
  const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration: "${value}"`);

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  return amount * UNIT_SECONDS[unit];
};
