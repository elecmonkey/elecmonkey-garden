import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export type OgPost = {
  locale: 'zh' | 'en';
  title: string;
  description: string;
};

export type OgOptions = {
  fontDirectory?: string;
  fontFiles?: string[];
  fontFamily?: string;
};

const WIDTH = 1200;
const HEIGHT = 630;
const INK = '#171717';
const TEXT_X = 72;
const TEXT_WIDTH = 900;
const DESCRIPTION_WIDTH = 840;
const TITLE_WEIGHT = 600;

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[char];
  });
}

export async function generateOgImage(post: OgPost, options: OgOptions = {}) {
  const fontFamily = options.fontFamily ?? 'Alibaba PuHuiTi 3.0';
  const family = escapeXml(fontFamily);
  const fontDirectory = options.fontDirectory;
  const fontFiles =
    options.fontFiles ??
    (fontDirectory
      ? ['55-Regular', '75-SemiBold', '85-Bold'].map((style) => {
          const name = `AlibabaPuHuiTi-3-${style}`;
          return path.join(fontDirectory, name, `${name}.ttf`);
        })
      : []);
  if (fontFiles.length === 0) {
    throw new Error(
      'Provide fonts with --font-dir <directory> or --font <file>.',
    );
  }
  for (const fontFile of fontFiles) {
    try {
      await access(fontFile);
    } catch {
      throw new Error(
        `Font not found: ${fontFile}. Set --font-dir or --font to your font files.`,
      );
    }
  }
  const renderOptions: ResvgRenderOptions = {
    font: {
      loadSystemFonts: false,
      fontFiles,
      defaultFontFamily: fontFamily,
    },
    languages: [post.locale === 'zh' ? 'zh-CN' : 'en'],
  };
  const widths = new Map<string, number>();

  function textWidth(text: string, size: number, weight: number): number {
    const key = `${size}:${weight}:${text}`;
    const cached = widths.get(key);
    if (cached !== undefined) return cached;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300"><text x="0" y="150" font-family="${family}" font-size="${size}" font-weight="${weight}">${escapeXml(text)}</text></svg>`;
    const width = new Resvg(svg, renderOptions).getBBox()?.width ?? 0;
    widths.set(key, width);
    return width;
  }

  function getWrapSegments(text: string) {
    const words = [
      ...new Intl.Segmenter(post.locale, { granularity: 'word' }).segment(text),
    ];
    const groups = [
      ...text.matchAll(/\([^()\n]{1,32}\)|（[^（）\n]{1,32}）/gu),
    ].map((match) => [match.index, match.index + match[0].length]);
    const segments: Array<{ segment: string; index: number }> = [];
    let segment = '';
    let start = 0;
    for (let i = 0; i < words.length; i += 1) {
      if (!segment) start = words[i].index;
      segment += words[i].segment;
      const end = words[i + 1]?.index ?? text.length;
      const left = text.slice(0, end).trimEnd();
      const right = text.slice(end).trimStart();
      const unsafe =
        /^[，。！？、；：,.!?;:)\]}】）》」』”’]/u.test(right) ||
        /[([{【《（「『“‘]$/u.test(left) ||
        groups.some(([from, to]) => end > from && end < to);
      if (end === text.length || !unsafe) {
        segments.push({ segment, index: start });
        segment = '';
      }
    }
    return segments;
  }

  function wrap(text: string, maxWidth: number, size: number, weight: number) {
    const lines: string[] = [];
    let line = '';
    for (const { segment } of getWrapSegments(text)) {
      if (textWidth(line + segment, size, weight) <= maxWidth) {
        line += segment;
        continue;
      }
      if (line.trim()) lines.push(line.trim());
      line = segment.trimStart();
      // Also wrap long unbroken words and URLs without clipping them.
      if (textWidth(line, size, weight) > maxWidth) {
        line = '';
        for (const character of segment.trim()) {
          if (textWidth(line + character, size, weight) > maxWidth) {
            lines.push(line);
            line = '';
          }
          line += character;
        }
      }
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  function wrapTitle(size: number): string[] {
    const colon = post.title.search(/[：:]/u);
    if (colon >= 0) {
      const parts = [
        post.title.slice(0, colon + 1),
        post.title.slice(colon + 1).trim(),
      ];
      if (
        parts.every(
          (part) => part && textWidth(part, size, TITLE_WEIGHT) <= TEXT_WIDTH,
        )
      )
        return parts;
    }
    const lines = wrap(post.title, TEXT_WIDTH, size, TITLE_WEIGHT);
    if (lines.length !== 2) return lines;
    const segments = getWrapSegments(post.title);
    let best = lines;
    let bestDifference = Infinity;
    for (const { index } of segments.slice(1)) {
      const left = post.title.slice(0, index).trim();
      const right = post.title.slice(index).trim();
      if (!left || !right) continue;
      const leftWidth = textWidth(left, size, TITLE_WEIGHT);
      const rightWidth = textWidth(right, size, TITLE_WEIGHT);
      const difference = Math.abs(leftWidth - rightWidth);
      if (
        leftWidth <= TEXT_WIDTH &&
        rightWidth <= TEXT_WIDTH &&
        difference < bestDifference
      ) {
        best = [left, right];
        bestDifference = difference;
      }
    }
    return best;
  }

  let titleSize = 76;
  let titleLines = wrapTitle(titleSize);
  while (titleLines.length > 2 && titleSize > 56) {
    titleSize -= 2;
    titleLines = wrapTitle(titleSize);
  }
  while (titleLines.length > 3 && titleSize > 42) {
    titleSize -= 2;
    titleLines = wrapTitle(titleSize);
  }
  // Exceptionally long titles can use a fourth line at the minimum size.
  if (titleLines.length > 4) {
    throw new Error(
      'Title is too long for this OG layout. Use a shorter title.',
    );
  }

  let descriptionSize = 30;
  let descriptionLines = wrap(
    post.description,
    DESCRIPTION_WIDTH,
    descriptionSize,
    400,
  );
  while (descriptionLines.length > 2 && descriptionSize > 20) {
    descriptionSize -= 1;
    descriptionLines = wrap(
      post.description,
      DESCRIPTION_WIDTH,
      descriptionSize,
      400,
    );
  }
  // Keep long descriptions intact with a third line at the minimum size.
  if (descriptionLines.length > 3) {
    throw new Error('Description is too long for this OG layout.');
  }

  const titleTop = 268;
  const titleLineHeight = titleSize * 1.18;
  const descriptionTop = Math.max(
    426,
    titleTop + (titleLines.length - 1) * titleLineHeight + 72,
  );
  const domain = post.locale === 'en' ? 'elecmonkey.com/en' : 'elecmonkey.com';

  const titleText = titleLines
    .map(
      (line, index) =>
        `<text x="${TEXT_X}" y="${titleTop + index * titleLineHeight}" font-size="${titleSize}" font-weight="${TITLE_WEIGHT}">${escapeXml(line)}</text>`,
    )
    .join('\n');
  const descriptionText = descriptionLines
    .map(
      (line, index) =>
        `<text x="${TEXT_X}" y="${descriptionTop + index * 40}" font-size="${descriptionSize}" fill="#525252">${escapeXml(line)}</text>`,
    )
    .join('\n');

  const icon = await readFile(
    new URL('../../site/public/icon.webp', import.meta.url),
  );
  const iconPng = await sharp(icon).resize(48, 48).png().toBuffer();
  const backgroundSvg = await readFile(
    new URL('../bg.svg', import.meta.url),
    'utf8',
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <title>${escapeXml(post.title)}</title>
  ${backgroundSvg}
  <image x="48" y="28" width="48" height="48" href="data:image/png;base64,${iconPng.toString('base64')}"/>
  <g transform="translate(1140 40)" fill="none" stroke="#737373" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 3H21V9M21 3L10 14"/>
    <path d="M9 3H5A2 2 0 0 0 3 5V19A2 2 0 0 0 5 21H19A2 2 0 0 0 21 19V15"/>
  </g>
  <g font-family="${family}" fill="${INK}">
    <text x="112" y="64" font-size="32"><tspan font-weight="700">Elecmonkey</tspan><tspan font-weight="400">'s Garden</tspan></text>
    <text x="1124" y="61" text-anchor="end" font-size="23" fill="#737373">${domain}</text>
    ${titleText}
    ${descriptionText}
  </g>
</svg>`;

  const png = new Resvg(svg, renderOptions).render().asPng();
  const jpg = await sharp(png)
    .jpeg({ quality: 95, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer();
  return { svg, png, jpg, width: WIDTH, height: HEIGHT };
}
