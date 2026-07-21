import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';
import { SyncProvider } from '@/components/SyncProvider';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });
const tajawal = Tajawal({ subsets: ['arabic', 'latin'], weight: ['400', '500', '700', '800', '900'], variable: '--font-tajawal', display: 'swap' });

export const metadata = {
  title: 'منصة إدارة السنتر - فيزياء',
  description: 'نظام إدارة متكامل لمركز الدروس الخصوصية في الفيزياء',
  manifest: '/manifest.json',
  themeColor: '#0B1220',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0B1220',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem('theme') === 'light') document.documentElement.classList.add('light'); } catch (e) {}`,
          }}
        />
      </head>
      <body>
        <SyncProvider>{children}</SyncProvider>
      </body>
    </html>
  );
}
