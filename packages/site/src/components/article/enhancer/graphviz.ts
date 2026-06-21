type VizInstance = {
  renderSVGElement: (
    source: string,
    options?: { graphAttributes?: Record<string, string> },
  ) => SVGSVGElement;
};

let vizPromise: Promise<VizInstance> | undefined;

export function enhanceGraphvizIslands(root: HTMLElement) {
  const diagrams = root.querySelectorAll<HTMLElement>('[data-md-island="graphviz"]');
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
    diagram.classList.add('article-graphviz');

    void getViz().then((viz) => {
      if (!diagram.isConnected) {
        return;
      }

      const svg = viz.renderSVGElement(code, {
        graphAttributes: {
          bgcolor: 'transparent',
        },
      });
      adaptColor(svg);
      applyScaledSize(svg, Number(diagram.dataset.scale) || 1);
      diagram.replaceChildren(svg);
      diagram.dataset.enhanced = 'true';
    }).catch((error) => {
      console.error('Graphviz 渲染失败:', error);
      diagram.dataset.enhanced = 'error';
    }).finally(() => {
      delete diagram.dataset.enhancing;
    });
  });
}

function isBlack(value: string | null): boolean {
  return value === 'black' || value === '#000000' || value === '#000';
}

function isWhite(value: string | null): boolean {
  return value === 'white' || value === '#ffffff' || value === '#fff';
}

function adaptColor(element: Element) {
  const stroke = element.getAttribute('stroke');
  if (isBlack(stroke)) {
    element.setAttribute('stroke', 'currentColor');
  }

  const fill = element.getAttribute('fill');
  if (isBlack(fill)) {
    element.setAttribute('fill', 'currentColor');
  } else if (isWhite(fill)) {
    element.setAttribute('fill', 'var(--card)');
  }

  if (element.tagName.toLowerCase() === 'text' && !fill) {
    element.setAttribute('fill', 'currentColor');
  }

  for (const child of Array.from(element.children)) {
    adaptColor(child);
  }
}

function applyScaledSize(svg: SVGSVGElement, scale: number) {
  if (!Number.isFinite(scale) || scale <= 0 || scale === 1) {
    return;
  }

  for (const attrName of ['width', 'height']) {
    const raw = svg.getAttribute(attrName);
    if (!raw) {
      continue;
    }

    const match = raw.trim().match(/^([0-9]*\.?[0-9]+)\s*([a-z%]*)$/i);
    if (!match) {
      continue;
    }

    const value = Number(match[1]) * scale;
    const unit = match[2] || '';
    svg.setAttribute(attrName, `${value}${unit}`);
  }
}

function getViz(): Promise<VizInstance> {
  if (!vizPromise) {
    vizPromise = import('@viz-js/viz').then((module) => module.instance());
  }

  return vizPromise;
}
