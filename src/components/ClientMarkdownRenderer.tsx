'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Components } from 'react-markdown';

// 动态导入客户端组件
const CodeBlock = dynamic(() => import('./CodeBlock'), { 
  ssr: false,
  loading: () => <div className="p-4 text-gray-500 dark:text-gray-400">加载代码高亮，需要启用 JavaScript ...</div>
});
const MermaidRenderer = dynamic(() => import('./MermaidRenderer'), { 
  ssr: false,
  loading: () => <div className="p-4 text-gray-500 dark:text-gray-400">加载图表，需要启用 JavaScript ...</div>
});

// 使用 react-markdown 的 Components 类型来确保兼容性
export const CodeComponent: Components['code'] = ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  
  // 如果是 Mermaid 代码块，使用 Mermaid 渲染器
  if (match && match[1] === 'mermaid') {
    const code = String(children || '').replace(/\n$/, '');
    return <MermaidRenderer chart={code} />;
  }
  
  // 其他代码块使用原来的 CodeBlock 组件
  if (match) {
    return (
      <CodeBlock 
        language={match[1]} 
        code={String(children || '').replace(/\n$/, '')}
        {...props}
      />
    );
  }
  
  // 增强内联代码样式
  const isDark = false;
  const bgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const textColor = isDark ? 'text-blue-300' : 'text-blue-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  
  // 内联代码
  return (
    <code 
      className={`${bgColor} ${textColor} px-1.5 py-0.5 rounded border ${borderColor} font-mono text-sm ${className || ''}`} 
      {...props}
    >
      {children}
    </code>
  );
} 