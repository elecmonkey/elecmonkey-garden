import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Script from 'next/script';
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: "Elecmonkey的小花园",
  description: "Elecmonkey的小花园是一个专注于前端技术的技术博客，分享JavaScript、TypeScript、React、Vue、Next.js、Vite等前端开发技术、工程化实践、性能优化和最佳实践经验。",
  keywords: ["前端开发", "前端技术", "JavaScript", "TypeScript", "React", "Vue", "Next.js", "Vite", "前端工程化", "技术博客", "Elecmonkey"],
  authors: [{ name: "Elecmonkey" }],
  creator: "Elecmonkey",
  publisher: "Elecmonkey",
  icons: '/icon.png',
  metadataBase: new URL('https://www.elecmonkey.com'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.elecmonkey.com',
    title: "Elecmonkey的小花园 - 前端技术博客",
    description: "专注于前端技术的技术博客，分享前端开发经验、工程化实践和最佳实践",
    siteName: "Elecmonkey的小花园",
    images: [{
      url: '/icon.png',
      width: 512,
      height: 512,
      alt: 'Elecmonkey的小花园'
    }]
  },
  twitter: {
    card: 'summary',
    title: "Elecmonkey的小花园 - 前端技术博客",
    description: "专注于前端技术的技术博客，分享前端开发经验、工程化实践和最佳实践",
    images: ['/icon.png']
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Script
          src="https://lh.elecmonkey.com/script.js"
          data-website-id="703c2fe3-1b54-4a32-8503-37976cbed672"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
