# OG Generator

Generate bilingual 1200×630 social sharing images from blog post titles and descriptions, using the Garden logo and editable SVG background (`bg.svg`).

```sh
pnpm --filter @elecmonkey/garden-og-generator generate --slug <slug> --font-dir /path/to/AlibabaPuHuiTi-3
```

Images are saved to `output/`. Use JPG for sharing; PNG and SVG are also included. Run with `--help` for options.

`output/` is an ignored playground. Copy an approved JPG next to its Markdown post as `<slug>.og.jpg` and add `og: '<slug>.og.jpg'` to the frontmatter. Store each locale's image beside its own post. Builds copy these images to `/og/<locale>/<slug>.og.jpg` and check that referenced files exist. Posts without `og` use the site's default image. Commit the approved images; site builds do not run this generator or require its fonts.

Fonts are not bundled and must be provided explicitly. `--font-dir` expects an Alibaba PuHuiTi 3 directory containing the original Regular, SemiBold and Bold subdirectories.

Alternatively, pass `--font` once per TTF file; this overrides `--font-dir`. Set `--font-family` when using a different font family:

```sh
pnpm --filter @elecmonkey/garden-og-generator generate --slug <slug> --font /path/to/Regular.ttf --font /path/to/SemiBold.ttf --font /path/to/Bold.ttf --font-family "Font Family Name"
```

The default family is `Alibaba PuHuiTi 3.0`. Missing font files cause an error; system fonts are not used.
