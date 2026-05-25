'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Components } from 'react-markdown';
import CopyButton from '../code/CopyButton';
import CodeBlock from '@/components/article/code/CodeBlock';

// 只对 Mermaid 使用动态导入，因为它需要客户端 JavaScript
const MermaidRenderer = dynamic(() => import('./MermaidRenderer'), { 
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">加载图表，需要启用 JavaScript ...</div>
});

type CodeComponentType = Exclude<NonNullable<Components['code']>, keyof React.JSX.IntrinsicElements>;
export type CodeRendererProps = CodeComponentType extends React.ComponentType<infer P> ? P : never;

export const CodeComponent = ({ className, children, ...props }: CodeRendererProps) => {
  // 解析语言和行号范围
  const match = /language-(\w+)(?:{([^}]+)})?/.exec(className || '');
  
  // 如果是 Mermaid 代码块，使用 Mermaid 渲染器
  if (match && match[1] === 'mermaid') {
    const code = String(children || '').replace(/\n$/, '');
    return <MermaidRenderer chart={code} />;
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
