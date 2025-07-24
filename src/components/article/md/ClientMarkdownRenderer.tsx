'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Components } from 'react-markdown';
import ServerFileDownloadRenderer from '../file-downloader/ServerFileDownloadRenderer';
import CopyButton from '../code/CopyButton';
import CodeBlock from '@/components/article/code/CodeBlock';

// 只对 Mermaid 使用动态导入，因为它需要客户端 JavaScript
const MermaidRenderer = dynamic(() => import('./MermaidRenderer'), { 
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">加载图表，需要启用 JavaScript ...</div>
});

// 使用 react-markdown 的 Components 类型来确保兼容性
export const CodeComponent: Components['code'] = ({ className, children, ...props }) => {
  // 解析语言和行号范围
  const match = /language-(\w+)(?:{([^}]+)})?/.exec(className || '');
  
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
  
  // 其他代码块使用 CodeBlock 组件
  if (match) {
    const code = String(children || '').replace(/\n$/, '');
    return (
      <div className="relative">
        <CodeBlock 
          language={match[1] + (match[2] ? `{${match[2]}}` : '')} 
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
      className="bg-muted text-primary px-1.5 py-0.5 rounded border border-border font-mono text-base" 
      {...props}
    >
      {children}
    </code>
  );
}