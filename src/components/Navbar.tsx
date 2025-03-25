"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  // 检查是否是主页
  const isHomePage = pathname === '/';
  
  // 控制移动端菜单展开/折叠的状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 切换菜单状态
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // 定义一个函数来确定导航链接是否为当前页面
  const isActive = (path: string) => {
    // 对于博客子页面的处理
    if (path === '/blog' && pathname.startsWith('/blog/')) {
      return true;
    }
    return pathname === path;
  };
  
  // 生成链接样式，当前页面有灰色背景
  const getLinkClassName = (path: string) => {
    const baseClasses = "px-3 py-2 rounded-lg transition-colors";
    const activeClasses = `${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium`;
    const inactiveClasses = `${baseClasses} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`;
    
    return isActive(path) ? activeClasses : inactiveClasses;
  };
  
  // 根据是否是主页设置不同的导航栏样式
  const navbarClasses = isHomePage 
    ? "bg-white dark:bg-gray-900 shadow-sm" // 主页导航栏：相对定位
    : "bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10"; // 其他页面导航栏：固定在顶部
  
  return (
    <nav className={navbarClasses}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* 网站标志 */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Elecmonkey的小花园
            </Link>
          </div>
          
          {/* 桌面导航链接和主题切换器 */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" className={getLinkClassName("/")}>
              首页
            </Link>
            <Link href="/blog" className={getLinkClassName("/blog")}>
              所有文章
            </Link>
            <Link href="/about" className={getLinkClassName("/about")}>
              关于我
            </Link>
            <div className="ml-2">
              <ThemeSwitcher />
            </div>
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="md:hidden flex items-center">
            <div className="mr-2">
              <ThemeSwitcher />
            </div>
            <button 
              className="text-gray-700 dark:text-gray-300 focus:outline-none p-2" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 移动端下拉菜单 */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col space-y-1 py-2">
            <Link 
              href="/" 
              className={`${getLinkClassName("/")} block`}
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link 
              href="/blog" 
              className={`${getLinkClassName("/blog")} block`}
              onClick={() => setIsMenuOpen(false)}
            >
              所有文章
            </Link>
            <Link 
              href="/about" 
              className={`${getLinkClassName("/about")} block`}
              onClick={() => setIsMenuOpen(false)}
            >
              关于我
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 