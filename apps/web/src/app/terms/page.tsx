import type { Metadata } from 'next';
import { ContentHero } from '@/components/content/content-hero';
import { LegalDoc, type LegalSection } from '@/components/content/legal-doc';

export const metadata: Metadata = {
  title: 'Terms & Conditions — HamroPasal',
  description: 'The terms that govern your use of the HamroPasal marketplace.',
};

const sections: LegalSection[] = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      'By creating an account, browsing, or making a purchase on HamroPasal, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use the platform.',
      'We may update these terms from time to time. Continued use after changes take effect means you accept the updated terms.',
    ],
  },
  {
    heading: 'Your account',
    paragraphs: [
      'You must provide accurate information and verify your email to make purchases. You are responsible for activity under your account and for keeping your password secure.',
      'We may suspend or terminate accounts that violate these terms, engage in fraud, or harm other users or sellers.',
    ],
  },
  {
    heading: 'The marketplace',
    paragraphs: [
      'HamroPasal is a multi-vendor marketplace. Products are listed and sold by independent sellers, not by HamroPasal directly. Each seller is responsible for their listings, pricing, stock and fulfilment.',
      'We work to keep listings accurate, but we do not warrant that product descriptions, images or availability are error-free.',
    ],
  },
  {
    heading: 'Orders & payment',
    paragraphs: [
      'When you place an order, you agree to pay the listed price plus any applicable delivery fees and minus any valid discounts. Prices are shown in Nepalese Rupees (NPR).',
      'We accept Cash on Delivery, eSewa, Khalti and card payments. Online payments are processed by third-party gateways and are subject to their terms.',
      'An order is confirmed once payment is received (or, for Cash on Delivery, once the seller confirms the order). Sellers may cancel orders that cannot be fulfilled, in which case any payment is refunded.',
    ],
  },
  {
    heading: 'Delivery',
    paragraphs: [
      'Delivery fees and timelines are set by each seller based on distance and their delivery zones. Estimated times are not guarantees.',
      'Risk of loss passes to you on delivery. Please inspect items on arrival and report issues promptly.',
    ],
  },
  {
    heading: 'Returns & refunds',
    paragraphs: [
      'You may request a return on eligible delivered items through your account. Approved returns, once completed, are refunded to your original payment method or arranged with the seller for Cash on Delivery orders.',
      'Certain items (e.g. perishable, intimate or personalised goods) may not be eligible for return.',
    ],
  },
  {
    heading: 'Seller obligations',
    paragraphs: [
      'Sellers must list only goods they are legally allowed to sell, describe them accurately, honour published prices, and fulfil confirmed orders. HamroPasal charges a commission on delivered orders and disburses the remainder to sellers via payouts.',
    ],
  },
  {
    heading: 'Prohibited conduct',
    paragraphs: [
      'You agree not to misuse the platform — including posting unlawful content, infringing intellectual property, attempting to disrupt the service, or using it to defraud others.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'HamroPasal provides the platform “as is”. To the extent permitted by law, we are not liable for indirect or consequential damages arising from your use of the platform or from transactions between buyers and sellers.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: ['Questions about these terms can be sent to support@hamropasal.com.'],
  },
];

export default function TermsPage() {
  return (
    <>
      <ContentHero title="Terms & Conditions" eyebrow="Terms" />
      <LegalDoc
        updated="11 June 2026"
        intro="These terms govern your access to and use of HamroPasal — Nepal’s online marketplace operated for buyers and sellers across the country."
        sections={sections}
      />
    </>
  );
}
