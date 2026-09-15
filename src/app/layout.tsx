import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings } from '@/lib/db';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'RRB Group D Answer Key 2026 - Notification, Answer Key, Cut Off & Result',
    template: '%s | RRB Group D Answer Key',
  },
  description: 'Official Railway Recruitment Board RRB Group D Answer Key, Cut Off Marks, Question Paper PDF, CBT Syllabus & Result Updates 2026.',
  keywords: [
    'RRB Group D Answer Key 2026',
    'RRB Answer Key Calculator',
    'Railway Group D Result',
    'RRB Cut Off Marks',
    'RRB CBT Syllabus',
    'Railway Recruitment Cell RRC',
    'RRB Response Sheet 2026',
    'RRB Scorecard Calculator',
  ],
  authors: [{ name: 'RRB Group D Team', url: baseUrl }],
  creator: 'RRB Group D Answer Key Portal',
  publisher: 'RRB Group D Answer Key Portal',
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    siteName: 'RRB Group D Answer Key 2026',
    title: 'RRB Group D Answer Key 2026 - Notification, Answer Key, Cut Off & Result',
    description: 'Official Railway Recruitment Board RRB Group D Answer Key, Cut Off Marks, Question Paper PDF, CBT Syllabus & Result Updates 2026.',
    images: [
      {
        url: 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png',
        width: 1200,
        height: 630,
        alt: 'RRB Group D Answer Key Portal Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RRB Group D Answer Key 2026 - Notification, Answer Key, Cut Off & Result',
    description: 'Official Railway Recruitment Board RRB Group D Answer Key, Cut Off Marks, Question Paper PDF, CBT Syllabus & Result Updates 2026.',
    images: ['https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings server-side to drive Header menu visibility
  const settings = await getSettings();

  // Parse site_menu JSON from settings
  let menuItems: { title: string; url: string; visible: number }[] = [];
  try {
    if (settings.site_menu) {
      menuItems = JSON.parse(settings.site_menu);
    }
  } catch (_) {
    // Fallback to empty — Header will use its own hardcoded defaults
  }

  // Only pass visible menu items to Header
  const visibleMenuItems = menuItems
    .filter((item) => item.visible === 1)
    .map((item) => ({ title: item.title, url: item.url }));

  const faviconUrl = settings.site_favicon || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/favicon_1784561384_6a5e3ee8e8ce5.png';
  const showAds = settings.ads_status === '1';

  return (
    <html lang="en">
      <head>
        {/* Google Search Console Verification */}
        {settings.google_search_console && (
          <meta name="google-site-verification" content={settings.google_search_console} />
        )}

        {/* Google Analytics 4 (gtag.js) */}
        {settings.google_analytics && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics}`} />
            <script
              id="google-analytics-init"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.google_analytics}');
                `,
              }}
            />
          </>
        )}

        {/* Google AdSense Header Script */}
        {showAds && settings.google_adsense_header && (
          <script
            id="google-adsense-header"
            dangerouslySetInnerHTML={{ __html: settings.google_adsense_header }}
          />
        )}

        {/* Speed Optimization: Preconnect & DNS-Prefetch for Fonts & Cloudflare R2 CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://rrbgroupdanswerkey.rusikakisku.workers.dev" />
        <link rel="preconnect" href="https://rrbgroupdanswerkey.rusikakisku.workers.dev" crossOrigin="anonymous" />
        
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href={faviconUrl} />

        {/* Global JSON-LD Schema: WebSite & Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': `${baseUrl}/#website`,
                  'url': baseUrl,
                  'name': settings.site_title || 'RRB Group D Answer Key',
                  'description': settings.site_description || 'Official Railway Recruitment Board RRB Group D Answer Key, Cut Off Marks, Question Paper PDF, CBT Syllabus & Result Updates 2026.',
                  'publisher': {
                    '@id': `${baseUrl}/#organization`,
                  },
                  'potentialAction': {
                    '@type': 'SearchAction',
                    'target': `${baseUrl}/blogs/?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                  },
                  'inLanguage': 'en-IN',
                },
                {
                  '@type': 'Organization',
                  '@id': `${baseUrl}/#organization`,
                  'name': settings.site_title || 'RRB Group D Answer Key Portal',
                  'url': baseUrl,
                  'logo': {
                    '@type': 'ImageObject',
                    'url': settings.site_logo || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <Header
          siteTitle={settings.site_title}
          siteTagline={settings.site_tagline}
          siteLogo={settings.site_logo}
          menuItems={visibleMenuItems.length > 0 ? visibleMenuItems : undefined}
          showAds={showAds}
        />
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
