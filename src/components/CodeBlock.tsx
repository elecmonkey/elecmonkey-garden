'use client';

import { useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// 导入常用语言支持
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import java from 'react-syntax-highlighter/dist/cjs/languages/prism/java';
import c from 'react-syntax-highlighter/dist/cjs/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/cjs/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/cjs/languages/prism/csharp';
import go from 'react-syntax-highlighter/dist/cjs/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/cjs/languages/prism/rust';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml';
import swift from 'react-syntax-highlighter/dist/cjs/languages/prism/swift';
import php from 'react-syntax-highlighter/dist/cjs/languages/prism/php';
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql';

// 注册语言
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash); // shell别名
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown); // markdown别名
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python); // python别名
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cs', csharp); // csharp别名
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('rs', rust); // rust别名
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('yml', yaml); // yaml别名
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('sql', sql);

// 复制按钮组件
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isDarkTheme = false;

  return (
    <button
      onClick={copyToClipboard}
      className={`absolute top-2 right-2 p-1.5 rounded-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} text-sm transition-colors`}
      aria-label="复制代码"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )}
    </button>
  );
}

// 代码块容器组件
export default function CodeBlock({ language, code, ...props }: { 
  language: string, 
  code: string, 
  [key: string]: unknown 
}) {
  const isDarkTheme = false;

  // 根据当前主题选择样式
  const syntaxStyle = isDarkTheme ? vscDarkPlus : oneLight;
  
  // 根据主题设置颜色
  const headerBgColor = isDarkTheme ? 'bg-gray-800' : 'bg-gray-200';
  const headerTextColor = isDarkTheme ? 'text-gray-300' : 'text-gray-700';
  const borderColor = isDarkTheme ? 'border-gray-700' : 'border-gray-300';
  const lineNumberColor = isDarkTheme ? '#6e7681' : '#aaa';
  const lineNumberBorderColor = isDarkTheme ? '#334155' : '#e5e5e5';

  return (
    <div className={`relative my-6 rounded-sm overflow-hidden border ${borderColor}`}>
      <div className={`${headerBgColor} ${headerTextColor} text-xs py-1 px-3 font-mono border-b ${borderColor}`}>
        {language}
      </div>
      <div className="relative">
        <SyntaxHighlighter
          style={syntaxStyle}
          language={language}
          showLineNumbers={true}
          wrapLines={true}
          lineNumberStyle={{ 
            width: '3em',
            color: lineNumberColor, 
            textAlign: 'center', 
            userSelect: 'none',
            borderRight: `1px solid ${lineNumberBorderColor}`,
            marginRight: '1em',
            paddingRight: '0' 
          }}
          customStyle={{ 
            margin: 0, 
            padding: '0.8rem 0.5rem 0.8rem 0',
            borderRadius: 0,
            fontSize: '0.9rem',
            backgroundColor: isDarkTheme ? '#1e1e1e' : '#f8f8f8'
          }}
          PreTag="div"
          {...props}
        >
          {code}
        </SyntaxHighlighter>
        <CopyButton code={code} />
      </div>
    </div>
  );
} 