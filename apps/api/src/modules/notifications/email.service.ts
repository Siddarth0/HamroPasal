import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { otpEmailTemplate } from './email.templates';

// NOTE: Previously used the Resend SDK. Switched to SMTP (nodemailer) so emails
// can be sent from a personal Gmail via an App Password. Configure SMTP_HOST,
// SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM in your env.
//
// Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER=<you>@gmail.com,
// SMTP_PASS=<16-char Google App Password>, EMAIL_FROM=<you>@gmail.com
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // 465 = implicit TLS; 587 = STARTTLS
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // No SMTP credentials → skip silently (dev/local without mail set up).
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn(`✉️  SMTP not configured — skipping email to ${options.to}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM || env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
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
