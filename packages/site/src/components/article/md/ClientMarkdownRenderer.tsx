'use client';

import dynamic from '@/lib/dynamic-compat';
import React from 'react';
import { Components } from 'react-markdown';
import CopyButton from '../code/CopyButton';

// Mermaid and syntax highlighting are browser enhancements. Keeping them behind
// ssr:false prevents the static renderer from bundling heavy client-only deps.
const MermaidRenderer = dynamic(() => import('./MermaidRenderer'), {
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">加载图表，需要启用 JavaScript ...</div>,
});

const CodeBlock = dynamic(() => import('@/components/article/code/CodeBlock'), {
  ssr: false,
  loading: ({ language, code }) => <CodeBlockFallback language={language} code={code} />,
});

type CodeComponentType = Exclude<NonNullable<Components['code']>, keyof React.JSX.IntrinsicElements>;
export type CodeRendererProps = CodeComponentType extends React.ComponentType<infer P> ? P : never;

function CodeBlockFallback({ language, code }: { language: string; code: string }) {
  return (
    <div className="relative my-6 rounded-sm overflow-hidden border border-border">
      <div className="bg-muted text-muted-foreground text-xs py-1.5 px-3 font-mono border-b border-border font-bold">
        {language}
      </div>
      <pre className="m-0 overflow-x-auto bg-[#fafafa] p-4 text-[0.95rem] dark:bg-[#282c34]">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}

export const CodeComponent = ({ className, children, ...props }: CodeRendererProps) => {
  // 解析语言和行号范围
  const match = /language-(\w+)(?:{([^}]+)})?/.exec(className || '');

  // 如果是 Mermaid 代码块，使用 Mermaid 渲染器
  if (match && match[1] === 'mermaid') {
    const code = String(children || '').replace(/\n$/, '');
    return <MermaidRenderer chart={code} />;
  }

  // 其他代码块在 SSG 中先输出轻量 HTML，浏览器端再加载高亮增强。
  if (match) {
    const code = String(children || '').replace(/\n$/, '');
    const language = match[1] + (match[2] ? `{${match[2]}}` : '');
    return (
      <div className="relative">
        <CodeBlock language={language} code={code} {...props} />
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
};
