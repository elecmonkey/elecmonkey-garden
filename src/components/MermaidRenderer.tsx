'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

export default function MermaidRenderer({ chart, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('<div>加载中...</div>');

  useEffect(() => {
    // 避免在服务器端运行
    if (typeof window === 'undefined') return;

    // 动态导入 mermaid
    import('mermaid').then(async (mermaid) => {
      try {
        // 初始化 mermaid
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'strict',
        });

        // 生成 SVG
        const { svg } = await mermaid.default.render(`mermaid-${Math.random().toString(36).substring(2, 11)}`, chart);
        setSvgContent(svg);
      } catch (error) {
        console.error('渲染 Mermaid 图表失败:', error);
        setSvgContent(`<div class="p-4 bg-red-100 text-red-700 rounded">Mermaid 图表渲染失败</div>`);
      }
    });
  }, [chart]);

  return (
    <div 
      ref={containerRef}
      className={`my-6 overflow-x-auto flex justify-center bg-white dark:bg-gray-900 p-4 rounded-md ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
} 