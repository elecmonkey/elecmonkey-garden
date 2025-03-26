'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 生成页码数组
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfMaxPages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // 创建分页链接
  const createPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 删除scroll参数，不在分页中保留
    params.delete('scroll');
    
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return `${pathname}${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <nav className="mt-10 flex justify-center">
      <div className="grid grid-cols-[auto_auto_auto] items-center gap-2 w-full max-w-2xl">
        {/* 上一页按钮始终在最左侧 */}
        <div className="justify-self-start">
          {currentPage > 1 ? (
            <Link 
              href={createPageLink(currentPage - 1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              上一页
            </Link>
          ) : (
            <div className="w-[95px]"></div> 
          )}
        </div>

        {/* 页码按钮始终居中 */}
        <div className="flex justify-center space-x-2">
          {getPageNumbers().map((page) => (
            <Link
              key={page}
              href={createPageLink(page)}
              className={`px-4 py-2 rounded-lg transition-colors inline-block text-center min-w-[40px] ${
                page === currentPage
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>

        {/* 下一页按钮始终在最右侧 */}
        <div className="justify-self-end">
          {currentPage < totalPages ? (
            <Link 
              href={createPageLink(currentPage + 1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              下一页
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="w-[95px]"></div>
          )}
        </div>
      </div>
    </nav>
  );
} 