import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import '@/styles/syntax-highlighter-override.css';

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
import dart from 'react-syntax-highlighter/dist/cjs/languages/prism/dart';
import kotlin from 'react-syntax-highlighter/dist/cjs/languages/prism/kotlin';

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
SyntaxHighlighter.registerLanguage('dart', dart);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('kt', kotlin); // kotlin别名

// 代码块容器组件
export default function CodeBlock({ language, code, ...props }: { 
  language: string, 
  code: string, 
  [key: string]: unknown 
}) {
  return (
    <div className="relative my-6 rounded-sm overflow-hidden border border-gray-300 dark:border-gray-700">
      {/* 内联样式覆盖 */}
      <style jsx global>{`
        /* 全局覆盖React Syntax Highlighter的行号样式 */
        .react-syntax-highlighter-line-number,
        pre span.linenumber,
        span[class*="linenumber"],
        span[style*="fontStyle: italic"] {
          font-style: normal !important;
        }
        
        /* 强制第一列（行号）不使用斜体 */
        pre > span > span:first-child,
        pre > span > span.token.comment:first-child {
          font-style: normal !important;
        }
      `}</style>
      
      <div className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-1 px-3 font-mono border-b border-gray-300 dark:border-gray-700">
        {language}
      </div>
      <div className="relative">
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          showLineNumbers={true}
          wrapLines={true}
          lineNumberStyle={{ 
            width: '3em',
            color: '#aaa',
            textAlign: 'center', 
            userSelect: 'none',
            borderRight: '1px solid #e5e5e5',
            marginRight: "1em",
            paddingRight: '0',
            fontStyle: 'normal !important'
          }}
          lineNumberContainerStyle={{
            fontStyle: 'normal !important'
          }}
          customStyle={{ 
            margin: 0, 
            padding: '0.8rem 0.5rem 0.8rem 0',
            borderRadius: 0,
            fontSize: '0.9rem',
            backgroundColor: '#f8f8f8'
          }}
          PreTag="div"
          codeTagProps={{
            style: {
              fontStyle: 'normal'
            }
          }}
          {...props}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
} 