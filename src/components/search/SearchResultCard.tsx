'use client';

import Link from 'next/link';
import { SearchResultItem } from '@/lib/api';
import { useState } from 'react';

interface SearchResultCardProps {
  result: SearchResultItem;
  keyword: string;
}

export default function SearchResultCard({ result, keyword }: SearchResultCardProps) {
  const { post, matches } = result;
  const [showExcerpt] = useState(true);
  
  // 高亮关键词
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    
    try {
      const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
      return (
        <>
          {parts.map((part, i) => 
            part.toLowerCase() === keyword.toLowerCase() ? 
              <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">{part}</mark> : 
              part
          )}
        </>
      );
    } catch {
      // 如果正则表达式出错，直接返回原文本
      return text;
    }
  };
  
  return (
    <article className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
      <Link href={`/blog/${post.id}`}>
        <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
          {matches.title ? highlightKeyword(post.title, keyword) : post.title}
        </h3>
      </Link>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 align-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {new Date(post.date).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        {post.author && (
          <span>
            <span className="mx-2"></span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 align-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {post.author}
          </span>
        )}
      </p>
      
      {/* 描述或摘要 */}
      {matches.content.matched && matches.content.excerpt && showExcerpt ? (
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {highlightKeyword(matches.content.excerpt, keyword)}
        </p>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {matches.description ? highlightKeyword(post.description, keyword) : post.description}
        </p>
      )}
      
      {/* 匹配信息 */}
      <div className="mb-4 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          匹配位置: 
          <span className="space-x-2 ml-2">
            {matches.title && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs">
                标题
              </span>
            )}
            {matches.description && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs">
                描述
              </span>
            )}
            {matches.content.matched && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs">
                内容
              </span>
            )}
            {matches.tags.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs">
                标签
              </span>
            )}
          </span>
        </p>
      </div>
      
      {/* 匹配标签 */}
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag: string) => {
          const isMatched = matches.tags.includes(tag);
          return (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className={`${
                isMatched 
                  ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200' 
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              } px-2 py-1 rounded-md text-xs transition-colors`}
            >
              {isMatched ? highlightKeyword(tag, keyword) : tag}
            </Link>
          );
        })}
      </div>
    </article>
  );
} 