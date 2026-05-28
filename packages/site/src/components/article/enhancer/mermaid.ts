type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, source: string) => Promise<{ svg: string }>;
};

let mermaidPromise: Promise<MermaidApi> | undefined;
let mermaidRenderCounter = 0;

export function enhanceMermaidIslands(root: HTMLElement, postId: string) {
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
