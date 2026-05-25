"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ScrollToContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // 检查查询参数中是否有scroll=true
    if (searchParams.get('scroll') === 'true') {
      // 等待DOM和页面完全加载
      setTimeout(() => {
        // 滚动到大约5个文章卡的位置
        const scrollAmount = window.innerHeight * 0.8; // 大约5篇文章的高度
        
        // 从页面顶部开始滚动指定距离
        window.scrollTo({
          top: scrollAmount,
          behavior: 'smooth'
        });
      }, 500); // 增加延时以确保页面完全加载
    }
  }, [searchParams]);
  
  return null;
} 