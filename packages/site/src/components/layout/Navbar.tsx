"use client";

import Link from '@/components/Link';
import Image from '@/lib/image-compat';
import { usePathname } from '@/lib/router-compat';
import { useState } from 'react';
import dynamic from '@/lib/dynamic-compat';
import { dictionaries, hrefFor, localeLabels, stripLocalePrefix, withLocalePath, type Locale } from '@/lib/i18n';

// 动态导入 ThemeSwitcher 以完全避免 SSR 主题相关的 hydration 问题
const ThemeSwitcher = dynamic(() => import('@/components/ThemeSwitcher'), {
  ssr: false,
  loading: () => (
    <div className="p-2 w-9 h-9"></div>
  )
});

export default function Navbar({ locale }: { locale: Locale }) {
  const pathname = usePathname() || ''; // 提供默认值，避免undefined
  const dictionary = dictionaries[locale];
  const normalizedPathname = stripLocalePrefix(pathname);
  const homeHref = hrefFor(locale, '/');
  const otherLocale: Locale = locale === 'en' ? 'zh' : 'en';
  const otherLocaleHref = withLocalePath(pathname, otherLocale);

  // 检查是否是主页
  const isHomePage = pathname === homeHref;

  // 控制移动端菜单展开/折叠的状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 切换菜单状态
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 定义一个函数来确定导航链接是否为当前页面
  const isActive = (path: string) => {
    // 对于所有文章页面
    if (path === '/blog') {
      return normalizedPathname === '/blog';
    }
    // 对于搜索页面
    if (path === '/search') {
      return normalizedPathname === '/search';
    }
    // 其他页面保持精确匹配
    return normalizedPathname === path;
  };

  // 生成链接样式，当前页面有灰色背景
  const getLinkClassName = (path: string) => {
    const baseClasses = "px-3 py-2 transition-colors";
    const activeClasses = `${baseClasses} bg-accent text-foreground font-bold`;
    const inactiveClasses = `${baseClasses} text-foreground hover:bg-muted`;

    return isActive(path) ? activeClasses : inactiveClasses;
  };

  // 移动端菜单项样式，添加触摸反馈
  const getMobileLinkClassName = (path: string) => {
    const baseClasses = "block px-3 py-2 transition-colors active:bg-muted";
    const activeClasses = `${baseClasses} bg-accent text-foreground font-bold`;
    const inactiveClasses = `${baseClasses} text-foreground hover:bg-muted`;

    return isActive(path) ? activeClasses : inactiveClasses;
  };

  // 根据是否是主页设置不同的导航栏样式
  const navbarClasses = isHomePage
    ? "bg-card shadow-sm" // 主页导航栏：相对定位
    : "bg-card shadow-sm sticky top-0 z-20"; // 其他页面导航栏：固定在顶部

  const littleCircleButtonClass = "text-muted-foreground focus:outline-none p-2 rounded-full active:bg-muted hover:bg-accent transition-colors mx-0.5";

  return (
    <nav className={`${navbarClasses} border-b border-border/20 select-none`}>
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* 网站标志 */}
          <div className="flex items-center">
            <Link
              href={homeHref}
              prefetch
              className="flex items-center gap-2 select-none"
              onClick={(e) => {
                // 如果已经在首页，阻止默认行为避免硬刷新
                if (pathname === homeHref) {
                  e.preventDefault();
                }
              }}
            >
              <Image
                src="/icon.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-foreground">
                {dictionary.siteName}
              </span>
            </Link>
          </div>

          {/* 桌面导航链接和主题切换器 */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href={homeHref}
              prefetch
              className={getLinkClassName("/")}
              onClick={(e) => {
                if (pathname === homeHref) {
                  e.preventDefault();
                }
              }}
            >
              {dictionary.nav.home}
            </Link>
            <Link href={hrefFor(locale, '/blog')} prefetch className={getLinkClassName("/blog")}>
              {dictionary.nav.blog}
            </Link>
            <Link href={hrefFor(locale, '/about')} prefetch className={getLinkClassName("/about")}>
              {dictionary.nav.about}
            </Link>
            <Link
              href={hrefFor(locale, '/search')}
              prefetch
              className={getLinkClassName("/search")}
              aria-label={dictionary.nav.search}
            >
              <span className="sr-only">{dictionary.nav.search}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <a href={otherLocaleHref} className="px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {localeLabels[otherLocale]}
            </a>
            <div className="mr-2">
              <ThemeSwitcher />
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden flex items-center">
            <button
              className={littleCircleButtonClass}
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
            isMenuOpen ? 'max-h-72 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col space-y-1 py-2">
            <Link
              href={homeHref}
              prefetch
              className={getMobileLinkClassName("/")}
              onClick={(e) => {
                if (pathname === homeHref) {
                  e.preventDefault();
                }
                setIsMenuOpen(false);
              }}
            >
              {dictionary.nav.home}
            </Link>
            <Link
              href={hrefFor(locale, '/blog')}
              prefetch
              className={getMobileLinkClassName("/blog")}
              onClick={() => setIsMenuOpen(false)}
            >
              {dictionary.nav.blog}
            </Link>
            <Link
              href={hrefFor(locale, '/about')}
              prefetch
              className={getMobileLinkClassName("/about")}
              onClick={() => setIsMenuOpen(false)}
            >
              {dictionary.nav.about}
            </Link>
            <a
              href={otherLocaleHref}
              className="block px-3 py-2 transition-colors active:bg-muted text-foreground hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              {localeLabels[otherLocale]}
            </a>
            <div className="flex items-center gap-2 pl-0 pr-3 py-2">
              <ThemeSwitcher />
              <Link
                href={hrefFor(locale, '/search')}
                prefetch
                className={`${getMobileLinkClassName("/search")} flex items-center justify-center`}
                onClick={() => setIsMenuOpen(false)}
                aria-label={dictionary.nav.search}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
