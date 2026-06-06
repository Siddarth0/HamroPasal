export const otpEmailTemplate = (
  otp: string,
  ttlMinutes: number,
  opts: { heading: string; intro: string },
): string => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h2 style="margin: 0 0 16px;">${opts.heading}</h2>
    <p style="margin: 0 0 16px; line-height: 1.5;">${opts.intro}</p>
    <p style="margin: 0 0 24px; text-align: center;">
      <span style="display: inline-block; background: #f1f5f9; color: #111827; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 16px 24px; border-radius: 8px;">
        ${otp}
      </span>
    </p>
    <p style="margin: 0; font-size: 13px; color: #999;">
      This code expires in ${ttlMinutes} minutes. If you didn't request this, you can ignore this email.
    </p>
  </div>
`;
