'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from '@/lib/router-compat';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export default function SearchBar({ className = '', placeholder = '搜索文章...' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL获取当前搜索关键词，使用useMemo或直接在状态初始化中获取
  const currentKeyword = searchParams.get('keyword') || '';
  const [keyword, setKeyword] = useState(currentKeyword);
  
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
      className={`flex items-stretch bg-card border border-border focus-within:border-foreground/30 transition-colors ${className}`}
    >
      <input
        type="text"
        name="keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <button 
        type="submit"
        className="border-l border-border px-4 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
        aria-label="搜索"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
