import type { MarkdownIsland } from '@/lib/api';

type ArticleEnhancerOptions = {
  postId: string;
  islands: MarkdownIsland[];
};

type Cleanup = () => void;

type EnhancedCodeBlock = HTMLElement & {
  __gardenRawSource?: string;
};

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, source: string) => Promise<{ svg: string }>;
};

let mermaidPromise: Promise<MermaidApi> | undefined;
let mermaidRenderCounter = 0;

export function enhanceArticleContent(root: HTMLElement, options: ArticleEnhancerOptions): Cleanup {
  const cleanups: Cleanup[] = [];

  enhanceExternalLinks(root);
  enhanceCodeIslands(root, cleanups);
  enhanceFileDownloadIslands(root);
  enhanceMermaidIslands(root, options.postId);

  root.dataset.enhanced = 'true';
  root.dataset.islandCount = String(options.islands.length);

  return () => {
    for (const cleanup of cleanups.splice(0)) {
      cleanup();
    }
  };
}


function enhanceExternalLinks(root: HTMLElement) {
  const links = root.querySelectorAll<HTMLAnchorElement>('a[href^="http://"], a[href^="https://"]');

  links.forEach((link) => {
    link.target = '_blank';
    const rel = new Set((link.rel || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.rel = Array.from(rel).join(' ');
  });
}

function enhanceCodeIslands(root: HTMLElement, cleanups: Cleanup[]) {
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

function processCodeLines(source: string, range: string | undefined): { nodes: HTMLElement[] } {
  const highlightLines = parseLineRange(range);
  const lines = source.replace(/\n$/, '').split('\n');

  return {
    nodes: lines.map((line, index) => {
      const lineNumber = index + 1;
      const row = document.createElement('span');
      row.className = 'article-code-line';
      row.dataset.lineNumber = String(lineNumber);

      if (highlightLines.has(lineNumber)) {
        row.classList.add('is-highlighted');
      }

      let displayLine = line;
      const trimmed = line.trimStart();
      if (trimmed.startsWith('+ ')) {
        row.classList.add('is-added');
        displayLine = line.replace('+ ', '');
      } else if (trimmed.startsWith('- ')) {
        row.classList.add('is-removed');
        displayLine = line.replace('- ', '');
      }

      const gutter = document.createElement('span');
      gutter.className = 'article-code-line-number';
      gutter.textContent = String(lineNumber);

      const content = document.createElement('span');
      content.className = 'article-code-line-content';
      content.textContent = displayLine || ' ';

      row.append(gutter, content);
      return row;
    }),
  };
}

function parseLineRange(range: string | undefined): Set<number> {
  const numbers = new Set<number>();
  if (!range) {
    return numbers;
  }

  for (const part of range.split(',')) {
    const value = part.trim();
    if (!value) {
      continue;
    }

    if (value.includes('-')) {
      const [startRaw, endRaw] = value.split('-');
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (Number.isInteger(start) && Number.isInteger(end) && start > 0 && end >= start) {
        for (let line = start; line <= end; line += 1) {
          numbers.add(line);
        }
      }
      continue;
    }

    const line = Number(value);
    if (Number.isInteger(line) && line > 0) {
      numbers.add(line);
    }
  }

  return numbers;
}

function enhanceFileDownloadIslands(root: HTMLElement) {
  const cards = root.querySelectorAll<HTMLElement>('[data-md-island="file-download"]');

  cards.forEach((card) => {
    if (card.dataset.enhanced === 'true') {
      return;
    }

    const filename = card.dataset.filename || '未知文件';
    const fileType = card.dataset.type || 'unknown';
    const url = card.dataset.url || '#';
    const size = card.dataset.size || '未知大小';
    const description = card.querySelector('.file-download-fallback p')?.textContent || '暂无描述';

    card.className = 'article-file-download';
    card.innerHTML = '';

    const icon = document.createElement('div');
    icon.className = `article-file-download-icon ${getFileIconClass(fileType)}`;
    icon.textContent = getFileIconText(fileType);

    const body = document.createElement('div');
    body.className = 'article-file-download-body';

    const title = document.createElement('h3');
    title.textContent = filename;

    const desc = document.createElement('p');
    desc.textContent = description;

    const meta = document.createElement('div');
    meta.className = 'article-file-download-meta';
    const sizeBadge = document.createElement('span');
    sizeBadge.textContent = size;
    const typeBadge = document.createElement('span');
    typeBadge.textContent = fileType.toUpperCase();
    meta.append(sizeBadge, typeBadge);

    body.append(title, desc, meta);

    const action = document.createElement('a');
    action.className = 'article-file-download-action';
    action.href = url;
    action.target = '_blank';
    action.rel = 'noopener noreferrer';
    action.setAttribute('aria-label', `下载 ${filename}`);
    action.textContent = '下载';

    card.append(icon, body, action);
    card.dataset.enhanced = 'true';
  });
}

function getFileIconClass(type: string): string {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'is-pdf';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'image':
      return 'is-image';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'is-archive';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'json':
    case 'html':
    case 'css':
    case 'rs':
    case 'rust':
    case 'code':
      return 'is-code';
    default:
      return 'is-generic';
  }
}

function getFileIconText(type: string): string {
  const normalized = type.toLowerCase();
  if (normalized === 'pdf') return 'PDF';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'image'].includes(normalized)) return 'IMG';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(normalized)) return 'ZIP';
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'rs', 'rust', 'code'].includes(normalized)) return '</>';
  return 'FILE';
}

function enhanceMermaidIslands(root: HTMLElement, postId: string) {
  const diagrams = root.querySelectorAll<HTMLElement>('[data-md-island="mermaid"]');
  if (diagrams.length === 0) {
    return;
  }

  diagrams.forEach((diagram) => {
    if (diagram.dataset.enhanced === 'true' || diagram.dataset.enhancing === 'true') {
      return;
    }

    const code = diagram.querySelector('code')?.textContent ?? '';
    if (!code.trim()) {
      return;
    }

    diagram.dataset.enhancing = 'true';
    diagram.classList.add('article-mermaid');

    void getMermaid().then(async (mermaid) => {
      if (!diagram.isConnected) {
        return;
      }

      const renderId = `garden-mermaid-${slugForDomId(postId)}-${diagram.dataset.islandId ?? 'diagram'}-${mermaidRenderCounter += 1}`;
      const { svg } = await mermaid.render(renderId, code);
      diagram.innerHTML = svg;
      diagram.dataset.enhanced = 'true';
    }).catch((error) => {
      console.error('Mermaid 渲染失败:', error);
      diagram.dataset.enhanced = 'error';
    }).finally(() => {
      delete diagram.dataset.enhancing;
    });
  });
}

function getMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((module) => {
      const mermaid = module.default as MermaidApi;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      });
      return mermaid;
    });
  }

  return mermaidPromise;
}

function slugForDomId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-');
}
