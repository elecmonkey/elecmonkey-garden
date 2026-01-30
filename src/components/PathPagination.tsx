import Link from 'next/link';

interface PathPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g. "/archive/202512" or "/tags/rust"
}

export default function PathPagination({ currentPage, totalPages, basePath }: PathPaginationProps) {
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
    if (page === 1) {
      return basePath;
    }
    return `${basePath}/page/${page}`;
  };

  return (
    <nav className="mt-10">
      <ul className="flex flex-wrap justify-center gap-2">
        {/* 上一页按钮 */}
        <li className="h-10">
          {currentPage > 1 ? (
            <Link 
              href={createPageLink(currentPage - 1)}
              className="h-10 px-4 py-2 bg-muted hover:bg-accent text-muted-foreground transition-colors flex items-center justify-center"
              aria-label="上一页"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden md:inline ml-1">上一页</span>
            </Link>
          ) : (
            <span className="w-10 md:w-[95px] inline-block"></span>
          )}
        </li>

        {/* 页码按钮 */}
        {getPageNumbers().map((page) => (
          <li key={page} className="h-10">
            <Link
              href={createPageLink(page)}
              className={`h-10 px-3 py-2 transition-colors flex items-center justify-center min-w-[40px] ${
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {page}
            </Link>
          </li>
        ))}

        {/* 下一页按钮 */}
        <li className="h-10">
          {currentPage < totalPages ? (
            <Link 
              href={createPageLink(currentPage + 1)}
              className="h-10 px-4 py-2 bg-muted hover:bg-accent text-muted-foreground transition-colors flex items-center justify-center"
              aria-label="下一页"
            >
              <span className="hidden md:inline mr-1">下一页</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="w-10 md:w-[95px] inline-block"></span>
          )}
        </li>
      </ul>
    </nav>
  );
}
