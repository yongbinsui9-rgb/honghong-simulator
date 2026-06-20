import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { NavbarWrapper } from '@/components/NavbarWrapper';
import { TawkTo } from '@/components/TawkTo';
import './globals.css';

export const metadata: Metadata = {
  title: '哄哄模拟器',
  description: 'AI 扮演你的另一半生气了，用真心话把 Ta 哄好吧！',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        <NavbarWrapper />
        {children}
        <TawkTo />
      </body>
    </html>
  );
}
