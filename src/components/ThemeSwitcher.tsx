"use client";

import { useState, useEffect } from 'react';

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // 应用主题的函数
  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      // const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // document.documentElement.classList.toggle('dark', systemPrefersDark);
    } else {
      // document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  useEffect(() => {
    // 初始化主题
    const savedTheme = localStorage.getItem('theme-preference') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    
    // 初始应用主题
    applyTheme(savedTheme);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (savedTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // localStorage.setItem('theme-preference', newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  const renderThemeIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'dark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      default:
        return (
          <div className="relative h-5 w-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 absolute right-0 top-0 text-yellow-500 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-0 bottom-0 text-blue-500 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="切换主题"
      >
        {renderThemeIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20">
          <div className="p-2">
            <button
              onClick={() => toggleTheme('light')}
              className={`flex items-center w-full p-2 text-left rounded-md ${theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>白天模式</span>
            </button>
            
            <button
              onClick={() => toggleTheme('dark')}
              className={`flex items-center w-full p-2 text-left rounded-md ${theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>夜间模式</span>
            </button>
            
            <button
              onClick={() => toggleTheme('system')}
              className={`flex items-center w-full p-2 text-left rounded-md ${theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <div className="relative h-5 w-5 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 absolute right-0 top-0 text-yellow-500 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-0 bottom-0 text-blue-500 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span>跟随系统</span>
            </button>
          </div>
        </div>
      )}
      
      {/* 点击外部关闭菜单 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
} 