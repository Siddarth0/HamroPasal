import { Resend } from 'resend';
import { env } from '@/config/env';
import { verificationEmailTemplate } from './email.templates';

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

export const sendVerificationEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  await sendEmail({
    to,
    subject: 'Verify your email',
    html: verificationEmailTemplate(verifyUrl),
  });
};
