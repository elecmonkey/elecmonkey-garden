'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  no_toc?: boolean;
  desktop?: boolean; // 新增：是否为桌面端固定侧栏
}

// 使用 dynamic 导入自身，实现延迟加载
const TableOfContents = dynamic(() => Promise.resolve(function TableOfContents({ no_toc = false, desktop = false }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 获取所有标题元素
    const elements = Array.from(document.querySelectorAll('h2, h3, h4, h5, h6'))
      .filter((element) => element.id) // 只获取有 id 的标题
      .map((element) => ({
        id: element.id,
        text: element.textContent || '',
        level: parseInt(element.tagName.charAt(1)),
      }));
    
    setHeadings(elements);

    // 设置 Intersection Observer 来检测当前可见的标题
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // 观察所有标题元素
    elements.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // 如果 no_toc 为 true，则不渲染任何内容
  if (no_toc) return null;

  // 如果没有标题，显示提示信息（仅桌面端）
  if (headings.length === 0 && desktop) {
    return (
      <div className="relative">
        {/* 底层卡片 - 灰色背景，向右下偏移 */}
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-muted/40 border border-border"></div>
        
        {/* 上层卡片 - 白色/主题背景 */}
        <div className="relative bg-card border border-border overflow-hidden">
          <div className="px-5 py-4">
            <h3 className="font-semibold text-lg">目录</h3>
          </div>
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">
            - 本文章无大纲 -
          </div>
        </div>
      </div>
    );
  }

  // 移动端没有标题时不显示
  if (headings.length === 0) return null;

  // 桌面端固定侧栏
  if (desktop) {
    return (
      <div className="relative">
        {/* 底层卡片 - 灰色背景，向右下偏移 */}
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-muted/40 border border-border"></div>
        
        {/* 上层卡片 - 白色/主题背景 */}
        <div className="relative bg-card border border-border overflow-hidden">
          <div className="px-5 py-4">
            <h3 className="font-semibold text-lg">目录</h3>
          </div>
          <div className="px-5 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <ul className="space-y-2">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  style={{
                    paddingLeft: `${(heading.level - 2) * 1}rem`,
                  }}
                >
                  <a
                    href={`#${heading.id}`}
                    className={`block py-1 text-sm transition-colors ${
                      activeId === heading.id
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(heading.id);
                      if (element) {
                        const offset = 100;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 移动端浮动按钮和侧栏
  return (
    <>
      {/* 圆形按钮 - 仅移动端显示 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 bottom-20 z-50 lg:hidden w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all
          ${isOpen ? 'hidden' : 'flex items-center justify-center'}
        `}
        aria-label="目录"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 12h16M4 18h7" 
          />
        </svg>
      </button>

      {/* 移动端侧栏 */}
      <nav 
        className={`
          fixed top-0 right-0 w-72 h-full z-40 bg-card shadow-lg border border-border
          transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* 关闭按钮 */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
          aria-label="关闭目录"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        <div className="p-4 overflow-y-auto h-full">
          <h2 className="text-lg font-semibold mb-4 text-foreground">目录</h2>
          <ul className="space-y-2">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{
                  paddingLeft: `${(heading.level - 2) * 1}rem`,
                }}
              >
                <a
                  href={`#${heading.id}`}
                  className={`block py-1 text-sm transition-colors ${
                    activeId === heading.id
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      const offset = 100;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                    setIsOpen(false);
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 移动端背景遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}), { ssr: false });

export default TableOfContents; 