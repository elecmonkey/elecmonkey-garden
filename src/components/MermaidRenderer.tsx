"use client";

import { useEffect, useRef, useState } from 'react';

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

export default function MermaidRenderer({ chart, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('<div>加载中...</div>');
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // 检查当前主题
    const checkTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    };

    // 初始检查
    checkTheme();

    // 监听主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 避免在服务器端运行
    if (typeof window === 'undefined') return;

    // 动态导入 mermaid
    import('mermaid').then(async (mermaid) => {
      try {
        // 设置主题
        const mermaidTheme = isDarkTheme ? 'dark' : 'default';
        
        // 初始化 mermaid
        mermaid.default.initialize({
          startOnLoad: false,
          theme: mermaidTheme,
          securityLevel: 'strict',
          darkMode: isDarkTheme,
          fontFamily: 'sans-serif',
          // 暗色模式下的颜色设置
          themeVariables: isDarkTheme ? {
            primaryColor: '#3b82f6',
            primaryTextColor: '#f1f5f9',
            primaryBorderColor: '#475569',
            lineColor: '#94a3b8',
            secondaryColor: '#4b5563',
            tertiaryColor: '#1e293b',
            backgroundColor: 'transparent',
            mainBkg: '#1e293b',
            nodeBorder: '#475569', 
            clusterBkg: '#1e293b',
            clusterBorder: '#475569',
            titleColor: '#f1f5f9',
            edgeLabelBackground: '#1e293b',
            textColor: '#f1f5f9'
          } : {}
        });

        // 生成 SVG
        const { svg } = await mermaid.default.render(`mermaid-${Math.random().toString(36).substring(2, 11)}`, chart);
        setSvgContent(svg);
      } catch (error) {
        console.error('渲染 Mermaid 图表失败:', error);
        setSvgContent(`<div class="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">Mermaid 图表渲染失败</div>`);
      }
    });

    return () => observer.disconnect();
  }, [chart, isDarkTheme]);

  return (
    <div 
      ref={containerRef}
      className={`my-6 overflow-x-auto flex justify-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-md shadow-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
} 