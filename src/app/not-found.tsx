import Link from 'next/link';
import { Metadata } from 'next';
import PageContainer from '@/components/PageContainer';

export const metadata: Metadata = {
  title: "页面未找到 - Elecmonkey的小花园",
};

export default function NotFound() {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</div>
        
        <h1 className="mt-6 text-3xl font-bold tracking-tight">页面走丢了</h1>
        
        <p className="mt-4 text-base text-gray-500 dark:text-gray-400 max-w-md">
          很抱歉，您要找的页面不存在或者已被移动到其他位置。
        </p>
        
        <div className="mt-8 flex space-x-4">
          <Link
            href="/"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            返回首页
          </Link>
          
          <Link
            href="/blog"
            className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
              />
            </svg>
            浏览文章
          </Link>
        </div>
      </div>
    </PageContainer>
  );
} 