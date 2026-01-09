import type { Metadata, Viewport } from 'next';
import { Orbitron, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SafeSpace - Cybersecurity URL Scanner | Hacker Terminal',
    template: '%s | SafeSpace by Krinc',
  },
  description:
    'Analyze suspicious URLs in a cyberpunk hacker terminal. Matrix-style security analysis by Krinc. Instant phishing detection, malware scanning, and safe URL previews.',
  keywords: [
    'URL checker',
    'link safety',
    'phishing detection',
    'malware scanner',
    'URL analysis',
    'suspicious link checker',
    'scam detector',
    'safe browsing',
    'URL security',
    'link validator',
    'website safety checker',
    'online security tool',
  ],
  authors: [{ name: 'Krinc' }],
  creator: 'Krinc',
  publisher: 'Krinc',
  metadataBase: new URL('https://safespace.krinc.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SafeSpace - Cyberpunk URL Security Scanner',
    description:
      'Analyze suspicious URLs in a matrix-style hacker terminal. Instant security analysis by Krinc.',
    type: 'website',
    locale: 'en_US',
    url: 'https://safespace.krinc.in',
    siteName: 'SafeSpace by Krinc',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeSpace - Cyberpunk URL Scanner',
    description:
      'Hacker-grade URL security analysis in matrix-style terminal.',
    creator: '@krinc',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#00b347', // Subdued green
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SafeSpace',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Analyze suspicious URLs for security threats before clicking. Get instant security analysis and safe previews of potentially malicious websites.',
  url: 'https://safespace.krinc.in',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
  },
  featureList: [
    'URL Security Analysis',
    'Phishing Detection',
    'Malware Scanner',
    'Safe Preview',
    'Real-time Threat Analysis',
    'Sandboxed Environment',
  ],
};

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does SafeSpace detect suspicious URLs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SafeSpace performs multiple security checks including HTTPS validation, suspicious pattern detection, domain analysis, URL length validation, and special character detection. It analyzes the URL structure, domain age, and known phishing patterns to provide a comprehensive safety score.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is SafeSpace free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, SafeSpace is completely free to use. You can analyze unlimited URLs without any cost or registration required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why do some websites not show in the preview?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most modern websites prevent iframe embedding for security using X-Frame-Options or CSP headers. This is expected behavior and demonstrates good security practices by those sites. The URL analysis is the main feature, while preview is supplementary.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can SafeSpace protect me from all malicious links?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'While SafeSpace provides comprehensive heuristic analysis, no automated system is 100% accurate. SafeSpace should be used as one layer of defense alongside human judgment and caution. Always verify URLs from trusted sources.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does SafeSpace store my browsing data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, SafeSpace does not store any user data or browsing history. The application is stateless and performs all analysis in real-time without storing URLs or personal information.',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      </head>
      <body className={`${jetbrainsMono.variable} ${orbitron.variable} font-mono`}>{children}</body>
    </html>
  );
}
