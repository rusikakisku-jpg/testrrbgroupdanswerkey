import type { Metadata } from 'next';
import React from 'react';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';

export const metadata: Metadata = {
  title: 'RRB Group D Answer Key Calculator 2026 - Check Response Sheet Score Online',
  description:
    'Calculate your RRB Group D CBT score with negative marking (1/3rd penalty). Instant section-wise analysis, raw score, accuracy percentage & scorecard download.',
  keywords: [
    'RRB Group D Answer Key Calculator',
    'RRB Group D Score Calculator',
    'RRB Group D Response Sheet 2026',
    'Railway Group D Marks Calculator',
    'RRB Scorecard 2026',
    'RRB Group D Cut Off Calculator',
    'DigiALM RRB Response Sheet Parser',
  ],
  alternates: {
    canonical: `${baseUrl}/answer-key-calculator/`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: `${baseUrl}/answer-key-calculator/`,
    siteName: 'RRB Group D Answer Key 2026',
    title: 'RRB Group D Answer Key Calculator 2026 - Calculate Score Online',
    description:
      'Paste your DigiALM response sheet URL to calculate your RRB Group D CBT raw score, negative marks, and section-wise accuracy instantly.',
    images: [
      {
        url: 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png',
        width: 1200,
        height: 630,
        alt: 'RRB Group D Answer Key Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RRB Group D Answer Key Calculator 2026',
    description:
      'Calculate your RRB Group D CBT raw score, negative marks, and section-wise accuracy instantly.',
    images: ['https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png'],
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'RRB Group D Answer Key Calculator',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    url: `${baseUrl}/answer-key-calculator/`,
    description:
      'Online tool to calculate RRB Group D Computer Based Test (CBT) score, section-wise breakdown, and negative marking penalty from official response sheet.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
