import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="zh-CN" className="transition-colors duration-200">
      <head>
        {/* 主题初始化脚本，避免闪烁 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // 从 localStorage 获取主题偏好
                const savedTheme = localStorage.getItem('theme-preference');
                
                // 如果有保存的偏好
                if (savedTheme) {
                  // 如果是明确的 light 或 dark
                  if (savedTheme === 'light' || savedTheme === 'dark') {
                    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
                  } 
                  // 如果是 system，则检查系统偏好
                  else if (savedTheme === 'system') {
                    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', systemPrefersDark);
                  }
                } 
                // 默认使用系统偏好
                else {
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.classList.toggle('dark', systemPrefersDark);
                }
              } catch (e) {
                // 出错时不应用暗色模式
                console.error('主题初始化出错:', e);
              }
            })();
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
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
