import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Elecmonkey的小花园",
  description: "ElecMonkey的小花园",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 主题初始化脚本，避免闪烁 */}
        {/* <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const savedTheme = localStorage.getItem('theme-preference');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                console.error('主题初始化出错:', e);
              }
            })();
          `
        }} /> */}
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen flex flex-col bg-white dark:bg-blue-950 text-gray-900 dark:text-blue-50`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
