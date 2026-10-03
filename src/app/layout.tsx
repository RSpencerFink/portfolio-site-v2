import type { Metadata, Viewport } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { SITE_URL, person } from '@/content/site';
import { SkyHost } from '@/components/sky/SkyHost';
import { Journey } from '@/components/journey/Journey';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';
import './globals.css';

// next/font downloads these at build time and serves them from out/_next (self-hosted).
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  display: 'swap',
  variable: '--font-inter-tight',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${person.name} | CTO & Co-founder, Brava`, template: `%s | ${person.name}` },
  description: `${person.name}: software engineer and visual artist. ${person.currently}.`,
  authors: [{ name: person.name, url: SITE_URL }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: { types: { 'text/plain': '/llms.txt' } },
};

export const viewport: Viewport = { themeColor: '#04050A', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>
        <SiteHeader />
        <SkyHost />
        <Journey />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
