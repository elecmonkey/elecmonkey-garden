import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React from 'react';

interface VueSFCSections {
  template: string;
  script: string;
  style: string;
}

interface VueSFCBlockProps {
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

export function parseVueSFC(code: string): VueSFCSections {
  const sections: VueSFCSections = {
    template: '',
    script: '',
    style: ''
  };

  // 解析Vue文件的不同部分
  const templateMatch = code.match(/(<template[^>]*>)([\s\S]*?)(<\/template>)/);
  const scriptMatch = code.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/);
  const styleMatch = code.match(/(<style[^>]*>)([\s\S]*?)(<\/style>)/);

  if (templateMatch) sections.template = templateMatch[1] + templateMatch[2] + templateMatch[3];
  if (scriptMatch) sections.script = scriptMatch[1] + scriptMatch[2] + scriptMatch[3];
  if (styleMatch) sections.style = styleMatch[1] + styleMatch[2] + styleMatch[3];

  return sections;
}

export function VueSFCBlock({ code, commonStyles }: VueSFCBlockProps) {
  const sections = parseVueSFC(code);

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.header}>
        Vue
      </div>
      <div className="relative">
        {sections.template && (
          <div>
            <div className={commonStyles.sectionHeader}>
              Template
            </div>
            <SyntaxHighlighter
              {...commonStyles.highlighter}
              language="html"
            >
              {sections.template}
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