'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopVisible, setIsDesktopVisible] = useState(true);

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

  if (headings.length === 0) return null;

  return (
    <>
      {/* 圆形按钮 - 移动端或桌面端隐藏时显示 */}
      <button
        onClick={() => {
          if (window.innerWidth >= 1536) {
            setIsDesktopVisible(true);
          } else {
            setIsOpen(true);
          }
        }}
        className={`fixed right-6 sm:right-12 lg:right-16 xl:right-20 2xl:right-24 bottom-20 z-50 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors ${
          isDesktopVisible ? '2xl:hidden' : ''
        }`}
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

      {/* 大纲内容 */}
      <nav 
        className={`
          fixed z-40 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[200%] opacity-0 pointer-events-none'}
          ${isDesktopVisible ? '2xl:translate-x-0 2xl:opacity-100 2xl:pointer-events-auto' : '2xl:translate-x-[200%] 2xl:opacity-0 2xl:pointer-events-none'}
          2xl:w-72 2xl:right-12 2xl:top-24 2xl:bottom-auto 2xl:rounded-lg
          top-0 right-0 w-72 h-full
        `}
      >
        {/* 关闭按钮 - 移动端和桌面端都显示 */}
        <button
          onClick={() => {
            if (window.innerWidth >= 1536) {
              setIsDesktopVisible(false);
            } else {
              setIsOpen(false);
            }
          }}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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

        <div className="p-4 overflow-y-auto max-h-[calc(100vh-8rem)] 2xl:max-h-[calc(100vh-12rem)]">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">目录</h2>
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
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
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
                    if (window.innerWidth < 1536) {
                      setIsOpen(false);
                    }
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
          className="fixed inset-0 bg-gray-600/50 dark:bg-gray-900/50 backdrop-blur-sm z-30 2xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
} 