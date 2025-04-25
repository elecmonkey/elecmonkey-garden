'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Components } from 'react-markdown';
import ServerFileDownloadRenderer from '../file-downloader/ServerFileDownloadRenderer';
import CopyButton from '../code/CopyButton';
import ServerCodeRenderer from '@/components/article/code/ServerCodeRenderer';

// 只对 Mermaid 使用动态导入，因为它需要客户端 JavaScript
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
  
  // 如果是 File 代码块，使用文件下载渲染器（服务端组件）
  if (match && match[1] === 'file') {
    const code = String(children || '').replace(/\n$/, '');
    return <ServerFileDownloadRenderer fileContent={code} />;
  }
  
  // 其他代码块使用服务端渲染器
  if (match) {
    const code = String(children || '').replace(/\n$/, '');
    return (
      <div className="relative">
        <ServerCodeRenderer 
          language={match[1]} 
          code={code}
          {...props}
        />
        <CopyButton code={code} />
      </div>
    );
  }
  
  // 增强内联代码样式
  return (
    <code 
      className="bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm" 
      {...props}
    >
      {children}
    </code>
  );
} 