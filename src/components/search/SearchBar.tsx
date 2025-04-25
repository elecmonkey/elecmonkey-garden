'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export default function SearchBar({ className = '', placeholder = '搜索文章...' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL获取当前搜索关键词
  const [keyword, setKeyword] = useState(() => {
    return searchParams.get('keyword') || '';
  });
  
  // 当URL中的关键词变化时更新状态
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
  }, [searchParams]);
  
  // 处理搜索提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果关键词为空，不进行搜索
    if (!keyword.trim()) return;
    
    // 构建搜索URL并导航
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      action="/search" 
      method="get" 
      className={`relative ${className}`}
    >
      <input
        type="text"
        name="keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                  focus:outline-none shadow-md focus:shadow-lg transition-all duration-150"
      />
      <button 
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 
                  hover:text-gray-700 dark:hover:text-gray-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
} 