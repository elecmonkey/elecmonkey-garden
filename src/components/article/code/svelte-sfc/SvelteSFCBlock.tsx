import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React from 'react';

interface SvelteSFCSections {
  markup: string;
  script: string;
  style: string;
}

interface SvelteSFCBlockProps {
  code: string;
  commonStyles: {
    container: string;
    header: string;
    sectionHeader: string;
    highlighter: {
      style: typeof oneLight;
      showLineNumbers: boolean;
      wrapLines: boolean;
      lineNumberStyle: React.CSSProperties;
      lineNumberContainerStyle: React.CSSProperties;
      customStyle: React.CSSProperties;
      PreTag: keyof React.JSX.IntrinsicElements;
      codeTagProps: {
        style: React.CSSProperties;
      };
    };
  };
}

export function parseSvelteSFC(code: string): SvelteSFCSections {
  const sections: SvelteSFCSections = {
    markup: '',
    script: '',
    style: ''
  };

  // 首先提取script和style部分
  const scriptMatch = code.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/);
  const styleMatch = code.match(/(<style[^>]*>)([\s\S]*?)(<\/style>)/);

  // 提取script和style部分
  if (scriptMatch) sections.script = scriptMatch[1] + scriptMatch[2] + scriptMatch[3];
  if (styleMatch) sections.style = styleMatch[1] + styleMatch[2] + styleMatch[3];

  // 移除script和style部分，剩下的就是markup部分
  let markup = code;
  if (scriptMatch) {
    markup = markup.replace(scriptMatch[0], '');
  }
  if (styleMatch) {
    markup = markup.replace(styleMatch[0], '');
  }

  // 清理markup部分的前后空白
  sections.markup = markup.trim();

  return sections;
}

export function SvelteSFCBlock({ code, commonStyles }: SvelteSFCBlockProps) {
  const sections = parseSvelteSFC(code);

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.header}>
        Svelte
      </div>
      <div className="relative">
        {sections.markup && (
          <div>
            <div className={commonStyles.sectionHeader}>
              Template
            </div>
            <SyntaxHighlighter
              {...commonStyles.highlighter}
              language="html"
            >
              {sections.markup}
            </SyntaxHighlighter>
          </div>
        )}
        {sections.script && (
          <div>
            <div className={commonStyles.sectionHeader}>
              Script
            </div>
            <SyntaxHighlighter
              {...commonStyles.highlighter}
              language="typescript"
            >
              {sections.script}
            </SyntaxHighlighter>
          </div>
        )}
        {sections.style && (
          <div>
            <div className={commonStyles.sectionHeader}>
              Style
            </div>
            <SyntaxHighlighter
              {...commonStyles.highlighter}
              language="css"
            >
              {sections.style}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
} 