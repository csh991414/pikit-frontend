import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Toast from '@/components/common/Toast';

export const metadata: Metadata = {
  title: 'Pikit - AI Prompt Archive',
  description: 'Collect and search AI image prompts from Instagram',
  openGraph: {
    title: "Pikit - AI Prompt Archive",
    description: "인스타그램 AI 이미지 프롬프트 아카이브",
    url: "https://pikit.life",
    siteName: "Pikit",
    images: [
      {
        url: "https://pikit.life/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pikit",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}
