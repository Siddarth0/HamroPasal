export const verificationEmailTemplate = (verifyUrl: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h2 style="margin: 0 0 16px;">Confirm your email</h2>
    <p style="margin: 0 0 16px; line-height: 1.5;">
      Thanks for signing up. Please confirm your email address to activate your account.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${verifyUrl}"
         style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
        Verify email
      </a>
    </p>
    <p style="margin: 0 0 8px; font-size: 13px; color: #666;">
      Or paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px; font-size: 13px; word-break: break-all;">
      <a href="${verifyUrl}" style="color: #2563eb;">${verifyUrl}</a>
    </p>
    <p style="margin: 0; font-size: 13px; color: #999;">
      This link expires in 24 hours. If you didn't create an account, you can ignore this email.
    </p>
  </div>
`;
