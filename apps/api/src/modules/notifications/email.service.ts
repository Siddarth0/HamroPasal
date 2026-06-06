import { Resend } from 'resend';
import { env } from '@/config/env';
import { otpEmailTemplate } from './email.templates';

const resend = new Resend(env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) console.error('❌ Email send failed:', error);
  } catch (err) {
    console.error('❌ Email send failed:', err);
  }
};

export const sendOtpEmail = async (
  to: string,
  otp: string,
  ttlMinutes: number,
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Your verification code',
    html: otpEmailTemplate(otp, ttlMinutes, {
      heading: 'Verify your email',
      intro: 'Use the code below to verify your email address and activate your account.',
    }),
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  otp: string,
  ttlMinutes: number,
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Your password reset code',
    html: otpEmailTemplate(otp, ttlMinutes, {
      heading: 'Reset your password',
      intro: 'Use the code below to reset your password.',
    }),
  });
};
