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
      block.__gardenRawSource = processed.sourceForCopy;

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
    button.innerHTML = copyIconSvg;

    const onClick = async () => {
      try {
        await navigator.clipboard.writeText(rawSource);
        button.innerHTML = copiedIconSvg;
        window.setTimeout(() => {
          if (button.isConnected) {
            button.innerHTML = copyIconSvg;
          }
        }, 1600);
      } catch {
        button.innerHTML = copyIconSvg;
        window.setTimeout(() => {
          if (button.isConnected) {
            button.innerHTML = copyIconSvg;
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

const copyIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>';
const copiedIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
