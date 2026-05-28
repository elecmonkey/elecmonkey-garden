export type ProcessedCodeLines = {
  nodes: HTMLElement[];
  sourceForHighlight: string;
};

export function processCodeLines(source: string, range: string | undefined): ProcessedCodeLines {
  const highlightLines = parseLineRange(range);
  const lines = source.replace(/\n$/, '').split('\n');
  const highlightSourceLines: string[] = [];

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
      highlightSourceLines.push(displayLine);

      const gutter = document.createElement('span');
      gutter.className = 'article-code-line-number';
      gutter.textContent = String(lineNumber);

      const content = document.createElement('span');
      content.className = 'article-code-line-content';
      content.textContent = displayLine || ' ';

      row.append(gutter, content);
      return row;
    }),
    sourceForHighlight: highlightSourceLines.join('\n'),
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
