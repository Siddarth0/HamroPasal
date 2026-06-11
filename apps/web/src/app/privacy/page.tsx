import type { Metadata } from 'next';
import { ContentHero } from '@/components/content/content-hero';
import { LegalDoc, type LegalSection } from '@/components/content/legal-doc';

export const metadata: Metadata = {
  title: 'Privacy Policy — HamroPasal',
  description: 'How HamroPasal collects, uses and protects your personal information.',
};

const sections: LegalSection[] = [
  {
    heading: 'Information we collect',
    paragraphs: [
      'Account details you provide — your name, email, phone number and password (stored encrypted).',
      'Order and delivery information — your shipping addresses, the items you buy, and your chosen payment method.',
      'Usage data — pages you view, searches you make and basic device/log information, used to improve the service.',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: [
      'To create and secure your account, process orders, calculate delivery, and provide customer support.',
      'To share necessary order details with the seller fulfilling your purchase (for example, your delivery address and contact number).',
      'To send transactional messages such as order confirmations and verification codes, and — if you opt in — updates about the app and offers.',
    ],
  },
  {
    heading: 'Payments',
    paragraphs: [
      'Card and wallet payments are handled by third-party providers (such as eSewa, Khalti and card gateways). We do not store your full card details on our servers; payments are verified directly with the provider.',
    ],
  },
  {
    heading: 'Sharing your information',
    paragraphs: [
      'We share data only as needed to run the marketplace — with the sellers who fulfil your orders, with payment and delivery providers, and where required by law.',
      'We do not sell your personal information.',
    ],
  },
  {
    heading: 'Cookies & sessions',
    paragraphs: [
      'We use secure, httpOnly cookies to keep you signed in and to protect your session. You can clear cookies in your browser, but some features (like checkout) won’t work without them.',
    ],
  },
  {
    heading: 'Data security',
    paragraphs: [
      'Passwords are hashed, sessions are scoped per app, and access to your data is restricted. No system is perfectly secure, but we take reasonable measures to protect your information.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You can view and update your profile and addresses in your account, and request deletion of your account by contacting support. You can opt out of marketing messages at any time.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy as the service evolves. We’ll revise the “last updated” date and, for significant changes, notify you where appropriate.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: ['For privacy questions or requests, email support@hamropasal.com.'],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <ContentHero title="Privacy Policy" eyebrow="Privacy" />
      <LegalDoc
        updated="11 June 2026"
        intro="Your privacy matters. This policy explains what information HamroPasal collects, how we use it, and the choices you have."
        sections={sections}
      />
    </>
  );
}
