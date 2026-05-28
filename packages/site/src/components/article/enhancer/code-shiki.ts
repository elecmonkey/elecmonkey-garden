import type { BundledLanguage, BundledTheme, ThemedTokenWithVariants } from 'shiki';

type ShikiApi = {
  codeToTokensWithThemes: (
    code: string,
    options: {
      lang: BundledLanguage;
      themes: {
        light: BundledTheme;
        dark: BundledTheme;
      };
      tokenizeMaxLineLength: number;
      tokenizeTimeLimit: number;
    },
  ) => Promise<ThemedTokenWithVariants[][]>;
};

let shikiPromise: Promise<ShikiApi> | undefined;

export function enhanceCodeSyntax(block: HTMLElement, source: string, language: string) {
  if (block.dataset.shiki === 'true' || block.dataset.shiki === 'loading') {
    return;
  }

  const shikiLanguage = normalizeShikiLanguage(language);
  if (!shikiLanguage) {
    block.dataset.shiki = 'skipped';
    return;
  }

  block.dataset.shiki = 'loading';

  void getShiki().then(async (shiki) => {
    const tokenLines = await shiki.codeToTokensWithThemes(source, {
      lang: shikiLanguage,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      tokenizeMaxLineLength: 20_000,
      tokenizeTimeLimit: 300,
    });

    if (!block.isConnected) {
      return;
    }

    const lineContents = block.querySelectorAll<HTMLElement>('.article-code-line-content');
    lineContents.forEach((lineContent, index) => {
      renderShikiTokens(lineContent, tokenLines[index] ?? []);
    });

    block.dataset.shiki = 'true';
  }).catch((error) => {
    console.warn(`Shiki 高亮失败：${language}`, error);
    block.dataset.shiki = 'error';
  });
}

function normalizeShikiLanguage(language: string): BundledLanguage | undefined {
  const normalized = language.trim().toLowerCase();
  if (!normalized || ['text', 'txt', 'plain', 'plaintext', 'console', 'terminal', 'output', 'dir', 'tree'].includes(normalized)) {
    return undefined;
  }

  const aliases: Record<string, BundledLanguage> = {
    cjs: 'javascript',
    htm: 'html',
    md: 'markdown',
    mjs: 'javascript',
    rs: 'rust',
    sh: 'bash',
    shell: 'bash',
    shellscript: 'bash',
    vue3: 'vue',
    yml: 'yaml',
    zsh: 'bash',
  };

  return aliases[normalized] ?? normalized as BundledLanguage;
}

function renderShikiTokens(target: HTMLElement, tokens: ThemedTokenWithVariants[]) {
  target.textContent = '';

  if (tokens.length === 0) {
    target.textContent = ' ';
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const token of tokens) {
    if (!token.content) {
      continue;
    }

    const span = document.createElement('span');
    span.className = 'article-code-token';
    span.textContent = token.content;

    const light = token.variants.light;
    const dark = token.variants.dark;
    if (light?.color) {
      span.style.setProperty('--shiki-light', light.color);
    }
    if (dark?.color) {
      span.style.setProperty('--shiki-dark', dark.color);
    }

    const fontStyle = light?.fontStyle ?? dark?.fontStyle;
    if (fontStyle !== undefined) {
      applyTokenFontStyle(span, fontStyle);
    }

    fragment.append(span);
  }

  if (!fragment.hasChildNodes()) {
    target.textContent = ' ';
    return;
  }

  target.append(fragment);
}

function applyTokenFontStyle(element: HTMLElement, fontStyle: number) {
  if ((fontStyle & 1) !== 0) {
    element.style.fontStyle = 'italic';
  }
  if ((fontStyle & 2) !== 0) {
    element.style.fontWeight = '700';
  }
  if ((fontStyle & 4) !== 0) {
    element.style.textDecoration = 'underline';
  }
}

function getShiki(): Promise<ShikiApi> {
  if (shikiPromise) {
    return shikiPromise;
  }

  const promise = import('shiki').then((module) => ({
    codeToTokensWithThemes: module.codeToTokensWithThemes,
  }));
  shikiPromise = promise;

  return promise;
}
