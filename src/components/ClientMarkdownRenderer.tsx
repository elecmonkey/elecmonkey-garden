'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Components } from 'react-markdown';

// 动态导入客户端组件
const CodeBlock = dynamic(() => import('./CodeBlock'), { 
  ssr: false,
  loading: () => <div className="p-4 text-gray-500">加载代码高亮，需要启用 JavaScript ...</div>
});
const MermaidRenderer = dynamic(() => import('./MermaidRenderer'), { 
  ssr: false,
  loading: () => <div className="p-4 text-gray-500">加载图表，需要启用 JavaScript ...</div>
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
  
  // 内联代码
  return (
    <code className={`bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded ${className || ''}`} {...props}>
      {children}
    </code>
  );
} 