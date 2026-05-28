import { processCodeLines } from './code-lines';
import { enhanceCodeSyntax } from './code-shiki';
import type { Cleanup } from './types';

type EnhancedCodeBlock = HTMLElement & {
  __gardenRawSource?: string;
};

export function enhanceCodeIslands(root: HTMLElement, cleanups: Cleanup[]) {
  const blocks = root.querySelectorAll<EnhancedCodeBlock>('[data-md-island="code"]');

  blocks.forEach((block) => {
    const code = block.querySelector<HTMLElement>('pre > code');
    const pre = block.querySelector<HTMLElement>('pre');
    if (!code || !pre) {
      return;
    }

    if (block.dataset.enhanced !== 'true') {
      block.classList.add('article-code-block');
      pre.classList.add('article-code-pre');
      code.classList.add('article-code');

      const language = block.dataset.language ?? normalizeLanguageFromClass(code.className) ?? 'text';
      const range = block.dataset.range;
      const rawSource = code.textContent ?? '';
      const processed = processCodeLines(rawSource, range);
      block.__gardenRawSource = rawSource;

      block.dataset.language = language;
      code.textContent = '';
      code.append(...processed.nodes);

      let label = block.querySelector<HTMLElement>('[data-code-language-label]');
      if (!label) {
        label = document.createElement('div');
        label.dataset.codeLanguageLabel = 'true';
        label.className = 'article-code-label';
        block.prepend(label);
      }
      label.textContent = language;

      block.dataset.enhanced = 'true';

      if (processed.sourceForHighlight.trim()) {
        enhanceCodeSyntax(block, processed.sourceForHighlight, language);
      }
    }

    const rawSource = block.__gardenRawSource ?? code.textContent ?? '';
    let button = block.querySelector<HTMLButtonElement>('[data-copy-button]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.dataset.copyButton = 'true';
      block.append(button);
    }
    button.className = 'article-copy-button';
    button.setAttribute('aria-label', '复制代码');
    if (button.textContent !== '已复制' && button.textContent !== '复制失败') {
      button.textContent = '复制';
    }

    const onClick = async () => {
      try {
        await navigator.clipboard.writeText(rawSource);
        button.textContent = '已复制';
        window.setTimeout(() => {
          if (button.isConnected) {
            button.textContent = '复制';
          }
        }, 1600);
      } catch {
        button.textContent = '复制失败';
        window.setTimeout(() => {
          if (button.isConnected) {
            button.textContent = '复制';
          }
        }, 1600);
      }
    };

    button.onclick = onClick;
    cleanups.push(() => {
      if (button?.onclick === onClick) {
        button.onclick = null;
      }
    });
  });
}

function normalizeLanguageFromClass(className: string): string | undefined {
  const match = className.match(/(?:^|\s)language-([^\s]+)/);
  return match?.[1];
}
