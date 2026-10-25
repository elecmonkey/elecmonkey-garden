import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { parse } from 'yaml';
import { generateOgImage, type OgPost } from './index.ts';

const packageDir = fileURLToPath(new URL('../', import.meta.url));
const rootDir = path.resolve(packageDir, '../..');

async function readPost(
  locale: OgPost['locale'],
  slug: string,
): Promise<OgPost> {
  const postsDir = path.join(
    rootDir,
    locale === 'en' ? 'content/en/posts' : 'content/posts',
  );
  const months = await readdir(postsDir, { withFileTypes: true });
  for (const month of months.filter((entry) => entry.isDirectory())) {
    const file = path.join(postsDir, month.name, `${slug}.md`);
    let source: string;
    try {
      source = await readFile(file, 'utf8');
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        continue;
      throw error;
    }
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
    if (!match) throw new Error(`Missing YAML frontmatter: ${file}`);
    const data: unknown = parse(match[1]);
    if (!data || typeof data !== 'object')
      throw new Error(`Invalid frontmatter: ${file}`);
    const fields = data as Record<string, unknown>;
    function field(key: string): string {
      const value = fields[key];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(
          `Frontmatter ${key} must be a non-empty string: ${file}`,
        );
      }
      return value.trim();
    }
    return {
      locale,
      title: field('title'),
      description: field('description'),
    };
  }
  throw new Error(`Article not found for ${locale}: ${slug}`);
}

async function main() {
  const { values } = parseArgs({
    options: {
      slug: { type: 'string' },
      locale: { type: 'string', default: 'all' },
      'out-dir': { type: 'string', default: path.join(packageDir, 'output') },
      font: { type: 'string', multiple: true },
      'font-dir': { type: 'string' },
      'font-family': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(
      'Usage: pnpm --filter @elecmonkey/garden-og-generator generate --slug <slug> [--locale zh|en|all] [--out-dir <path>] [--font-dir <path>] [--font <file>] [--font-family <family>]',
    );
    return;
  }
  const slug = values.slug;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Provide --slug with a valid article slug.');
  }
  if (!['zh', 'en', 'all'].includes(values.locale)) {
    throw new Error('--locale must be zh, en or all.');
  }
  const locales: OgPost['locale'][] =
    values.locale === 'all'
      ? ['zh', 'en']
      : [values.locale as OgPost['locale']];
  const outDir = path.resolve(values['out-dir']);
  // Resolve every requested article before writing either language's outputs.
  const posts = await Promise.all(
    locales.map((locale) => readPost(locale, slug)),
  );
  await mkdir(outDir, { recursive: true });
  for (const post of posts) {
    const { svg, png, jpg } = await generateOgImage(post, {
      fontDirectory: values['font-dir']
        ? path.resolve(values['font-dir'])
        : undefined,
      fontFiles: values.font?.map((font) => path.resolve(font)),
      fontFamily: values['font-family'],
    });
    const output = path.join(outDir, `${slug}.${post.locale}`);
    await writeFile(`${output}.svg`, svg);
    await writeFile(`${output}.png`, png);
    await writeFile(`${output}.jpg`, jpg);
    console.log(
      `${post.locale}: ${output}.jpg (1200×630, ${Math.round(jpg.length / 1024)} KiB; reference PNG ${Math.round(png.length / 1024)} KiB)`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
