'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPageRef = useRef(searchParams.get('page') || '1');
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // 第一次渲染时不触发动画
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevPageRef.current = searchParams.get('page') || '1';
      return;
    }
    
    const currentPage = searchParams.get('page') || '1';
    
    // 只有当页码发生变化时，才显示过渡动画
    if (prevPageRef.current !== currentPage) {
      // 触发淡出动画
      setIsTransitioning(true);
      
      // 设置延迟，恢复显示
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // 淡出动画持续时间
      
      prevPageRef.current = currentPage;
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div
      className={`transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
} 