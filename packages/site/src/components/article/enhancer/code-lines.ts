export type ProcessedCodeLines = {
  nodes: HTMLElement[];
  sourceForCopy: string;
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

      const { line: displayLine, diff } = extractDiffMarker(line);
      if (diff === 'added') {
        row.classList.add('is-added');
      } else if (diff === 'removed') {
        row.classList.add('is-removed');
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
    sourceForCopy: highlightSourceLines.join('\n'),
    sourceForHighlight: highlightSourceLines.join('\n'),
  };
}

function extractDiffMarker(line: string): { line: string; diff?: 'added' | 'removed' } {
  const match = line.match(/\s*\/\/\s*\[([+-])diff\]\s*$/);
  if (!match) {
    return { line };
  }

  return {
    line: line.slice(0, match.index).trimEnd(),
    diff: match[1] === '+' ? 'added' : 'removed',
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
