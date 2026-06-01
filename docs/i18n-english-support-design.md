# 英文 i18n 支持设计

## 目标

为博客添加英文支持，把英文站点作为一个平行的静态站点挂在 `/en` 下，同时保持所有现有中文 URL 不变。

目标 URL 模型：

- 中文保留现有路径，例如 `/`、`/blog`、`/blog/my-post`、`/archive`、`/search`。
- 英文使用同构路径，但增加 `/en` 前缀，例如 `/en`、`/en/blog`、`/en/blog/my-post`、`/en/archive`、`/en/search`。
- 中文内容继续放在 `content/posts`。
- 英文内容放在 `content/en/posts`。
- 首页、文章列表、文章详情、标签、归档、搜索、metadata、sitemap、导航都需要按语言隔离。

## 非目标

- 不自动翻译现有中文 Markdown。
- 不引入运行时服务端语言协商，站点继续保持静态优先。
- 第一版不要求英文文章必须有对应中文文章。
- 不修改现有中文 URL，也不默认增加 `/zh` 别名。

## Locale 模型

定义两个明确的 locale：

```ts
export type Locale = 'zh' | 'en';

export const defaultLocale: Locale = 'zh';
export const locales = ['zh', 'en'] as const;
```

路径规则：

- `zh` 不带 URL 前缀。
- `en` 使用 `/en` 前缀。
- locale 从 pathname 推导，不从浏览器语言推导。

建议增加这些 helper：

```ts
type Locale = 'zh' | 'en';

function getLocaleFromPathname(pathname: string): Locale;
function stripLocalePrefix(pathname: string): string;
function withLocalePath(pathname: string, locale: Locale): string;
function getLocalePrefix(locale: Locale): '' | '/en';
```

示例：

- `getLocaleFromPathname('/')` 返回 `zh`。
- `getLocaleFromPathname('/blog/foo')` 返回 `zh`。
- `getLocaleFromPathname('/en')` 返回 `en`。
- `getLocaleFromPathname('/en/blog/foo')` 返回 `en`。
- `withLocalePath('/blog/foo', 'zh')` 返回 `/blog/foo`。
- `withLocalePath('/blog/foo', 'en')` 返回 `/en/blog/foo`。

## 内容目录

当前中文目录：

```txt
content/posts/202605/example.md
```

新增英文目录：

```txt
content/en/posts/202605/example.md
```

英文目录沿用中文的月份目录和 Markdown 规范：

```md
---
title: 'Article Title'
date: 'YYYY-MM-DD'
description: 'Short description'
tags: ['Tag 1', 'Tag 2']
author: 'Elecmonkey'
---

Article content...
```

草稿和隐藏文章规则保持一致：

- `draft-*.md` 不参与编译。
- `hidden-*.md` 会编译，但不进入公开列表、搜索和 sitemap，直接访问时 metadata 使用 `noindex`。

## 生成内容结构

当前生成模块是单语言结构：

```ts
generatedPosts
generatedPublicPosts
generatedPostLoaders
```

新生成产物应该变成 locale-aware，并尽量把可预计算的数据放到编译阶段完成。建议结构：

```ts
export const generatedContentByLocale = {
  zh: {
    posts: [...],
    publicPosts: [...],
    tags: [...],
    months: [...],
    postLoaders: {
      'my-post': () => import('./posts/zh/my-post'),
    },
  },
  en: {
    posts: [...],
    publicPosts: [...],
    tags: [...],
    months: [...],
    postLoaders: {
      'my-post': () => import('./posts/en/my-post'),
    },
  },
} satisfies Record<Locale, GeneratedLocaleContent>;
```

`posts` 和 `publicPosts` 仍然只放列表页需要的轻量元数据，不内联完整 HTML。完整 HTML、TOC、islands 继续拆成单篇模块按需加载。

建议让编译产物直接包含以下预计算字段：

- 每个 post 的 `locale`。
- 每个 post 的 `prevPost` / `nextPost`，只在同 locale 的公开文章中计算。
- 每个 locale 的 `tags`，包含 tag 名和 count。
- 每个 locale 的 `months`，包含月份 id、count 和 displayName。
- 每个 locale 的搜索索引。
- 可选：每个 tag 的 post id 列表、每个月份的 post id 列表。

这样前端 `api.ts` 不需要在运行时重复扫描文章列表来构造 tag、month、prev/next 等索引，只负责按 locale 做简单读取和分页。

完整文章模块要避免中英文同 slug 时文件名冲突。建议输出：

```txt
packages/site/src/generated/posts/zh/<slug>.ts
packages/site/src/generated/posts/en/<slug>.ts
```

搜索索引也按语言拆分：

```txt
packages/site/src/generated/search-index.zh.json
packages/site/src/generated/search-index.en.json
```

SSG 复制到：

```txt
dist/static/search/zh/index.json
dist/static/search/en/index.json
```

这样英文搜索不会返回中文文章，中文搜索也不会返回英文文章。

## 内容编译器改造

多语言模式下，内容编译器应该成为事实上的内容数据库生成器。能在 Rust 侧一次性算好的内容，不应该放到前端运行时重复计算。

建议把 locale 概念下沉到 `crates/content-compiler`，让 Rust 直接产出 multi-locale manifest。N-API 和 Rsbuild 插件只负责传入配置、写文件、watch 和生成 TS/JSON 模块。

建议插件选项：

```ts
gardenContentPlugin({
  postsDirectory: '../../content/posts',
  locales: {
    zh: {
      postsDirectory: '../../content/posts',
    },
    en: {
      postsDirectory: '../../content/en/posts',
    },
  },
})
```

兼容策略不是重点，因为这个包主要由本站使用，可以接受破坏性升级并重新发布。为了减少迁移复杂度，可以只保留一个新配置形态：

- 必须提供 `locales`。
- `zh` 是默认 locale，不带 URL prefix。
- `en` 使用 `/en` prefix。
- 如果确实需要临时兼容旧配置，可以在站点迁移分支里短期保留，但不作为设计约束。

生成的 `PostData` 增加 `locale`：

```ts
type PostData = {
  locale: Locale;
  id: string;
  title: string;
  // existing fields
};
```

Rust 侧建议新增这些类型：

```rust
pub struct CompileSiteOptions {
    pub locales: Vec<LocaleCompileOptions>,
    pub default_locale: String,
}

pub struct LocaleCompileOptions {
    pub locale: String,
    pub posts_dir: PathBuf,
    pub url_prefix: String,
}

pub struct SiteManifest {
    pub locales: Vec<LocaleManifest>,
}

pub struct LocaleManifest {
    pub locale: String,
    pub url_prefix: String,
    pub posts: Vec<Post>,
    pub public_posts: Vec<Post>,
    pub tags: Vec<TagCount>,
    pub months: Vec<MonthData>,
    pub search_index: Vec<SearchIndexPost>,
}
```

Rust `Post` 类型建议直接包含：

- `locale`
- `prev_post`
- `next_post`
- `permalink`
- `source_path` 或 `source_key`
- `source_hash`
- `content_hash`

`permalink` 可由 Rust 根据 locale prefix 和 slug 算出，例如中文 `/blog/foo`，英文 `/en/blog/foo`。

Rust 侧负责：

- 遍历每个 locale 的 posts directory。
- 编译 Markdown 为 HTML、TOC、islands。
- 解析 frontmatter。
- 排序文章。
- 过滤 draft。
- 标记 hidden。
- 生成 publicPosts。
- 计算同 locale 内 prev/next。
- 计算 tag counts。
- 计算 month counts 和 displayName。
- 生成 search index。
- 计算 content hash 和 cache metadata。

JS 侧负责：

- 调用 N-API `compileSite(options)`。
- 把 Rust manifest 写成 TS 模块和 JSON 文件。
- 为每篇文章写独立懒加载模块。
- 在 Rsbuild build/dev hooks 中触发生成。
- dev server 下监听多 locale 内容目录。

这能把重计算集中在 Rust 侧，前端运行时只消费静态结构。

## 双语言核心问题梳理

### SSG 的问题

SSG 的关键不是“多渲染一套页面”这么简单，而是要保证每个静态路径都能拿到正确 locale 的内容、文案和 metadata。

需要解决：

- `getStaticPathnames()` 必须同时生成中文和英文路径。
- `render(pathname)` 必须能从 pathname 推导 locale，然后命中对应 route tree。
- `renderMetadataTags(pathname)` 必须先剥离 locale prefix，再解析业务路由。
- `render-page.ts` 的初始文章注入必须区分 `/blog/foo` 和 `/en/blog/foo`。
- `sitemap.xml` 必须包含两个 locale 的公开 URL。
- `robots.txt` 需要同时覆盖 `/search` 和 `/en/search`。
- `dist` 输出目录中 `/en` 应该是正常静态目录，而不是重定向或客户端路由兜底。

推荐策略：

- 静态路径生成仍在 TS 侧做，因为它和 React Router route shape 强相关。
- 路径生成使用 Rust 预计算的 locale manifest，不再扫描文章列表计算 tags/months。
- 每个 SSG 渲染任务只接受 pathname，并在渲染链路最早阶段推导 locale。
- 对同 slug 的中英文文章不做强绑定，SSG 按各自 locale manifest 独立生成。

### Markdown 编译的问题

Markdown 编译本身不需要知道 UI 语言，但它需要知道文章所属 locale，以保证产物和缓存不会串。

需要解决：

- 中文和英文可以有相同 slug，生成模块路径必须带 locale。
- 中文和英文可以有相同文件名和月份目录，cache key 必须带 locale。
- `hidden-`、`draft-` 规则对两个 locale 一致。
- Markdown 内部链接如果写绝对路径，英文文章需要作者自己写 `/en/...`，或者后续增加编译期链接重写规则。
- 代码块、Mermaid、KaTeX、file-download island 的编译逻辑可以完全复用。

建议：

- `md-compiler` 保持纯 Markdown 编译器，不引入 locale。
- `content-compiler` 在调用 `compile_markdown` 前后携带 locale，并把 locale 写入 `Post`。
- 单篇文章模块路径固定为 `generated/posts/<locale>/<slug>.ts`。
- cache manifest 结构改成按 locale 分组。

### 增量缓存和 watch 的问题

双语言后，缓存不能只按 slug 或源文件名判断。

cache key 应该包含：

- locale
- monthFolder
- slug
- source path
- source hash
- compiler version
- schema version

推荐 cache manifest：

```json
{
  "version": 2,
  "compilerVersion": "0.2.0",
  "schemaVersion": 4,
  "locales": {
    "zh": {
      "posts": {
        "my-post": {
          "monthFolder": "202605",
          "hash": "...",
          "contentHash": "...",
          "cacheFile": "zh/my-post.json"
        }
      }
    },
    "en": {
      "posts": {
        "my-post": {
          "monthFolder": "202605",
          "hash": "...",
          "contentHash": "...",
          "cacheFile": "en/my-post.json"
        }
      }
    }
  }
}
```

dev watch 需要监听所有 locale 的 posts directory：

- `content/posts`
- `content/en/posts`

发生变更时，只需要重新编译对应 locale 的受影响文章，但全局 manifest 中该 locale 的 tags/months/prev-next/search index 需要重算。另一个 locale 不需要重算。

第一版可以接受“某个 locale 变更就重编该 locale 全量内容”，因为 Rust 编译速度更可控，复杂度比精细增量低。

### 搜索的问题

搜索应该是完全按 locale 隔离的静态索引。

需要解决：

- 中文 search index 不包含英文文章。
- 英文 search index 不包含中文文章。
- hidden post 不进入任一 search index。
- search index 的 fetch URL 要和 SSG copy 目标一致。
- search index 的缓存要按 locale 分组。

推荐：

- Rust 侧生成 `search_index` 数组。
- JS 侧写出 `search-index.<locale>.json`。
- SSG 复制到 `/static/search/<locale>/index.json`。
- 客户端 `loadSearchIndexPosts(locale)` 根据 locale 读取。

### tag、archive、pagination 的问题

这些数据不应该在 React render 时反复从 posts 里 reduce。

推荐 Rust 预计算：

- `tags: TagCount[]`
- `months: MonthData[]`
- 每个 tag 的 post id 列表，可选
- 每个月份的 post id 列表，可选

分页本身可以在 TS 侧做，因为 page size 是 UI 策略；但分页的数据源应该来自 Rust 预计算的 locale index。

如果希望 SSG 路径也减少 TS 侧计算，可以让 Rust 直接输出：

```ts
type StaticPathEntry = {
  locale: Locale;
  pathname: string;
  kind: 'home' | 'blog' | 'post' | 'tag' | 'archive' | 'search';
};
```

但这个会把 route shape 也下沉到 Rust。当前建议不这么做，避免 Rust 和 React Router 路由强耦合。

### slug 和跨语言对应关系的问题

第一版不要求中英文文章一一对应。

同 slug 的中英文文章视为可对应，但不是强约束：

- `/blog/foo` 和 `/en/blog/foo` 可以同时存在。
- 也可以只有中文或只有英文。
- language switcher 和 `hreflang` 只有在目标 locale 存在同 slug 时才指向文章详情，否则回退到列表页。

未来如果需要显式关联，可以在 frontmatter 增加：

```md
translations:
  en: foo-en
  zh: foo
```

第一版不建议引入，避免增加内容维护成本。

## 内容 API 改造

当前 `packages/site/src/lib/api.ts` 使用单语言全局索引，需要改成按 locale 读取生成产物。

重构后，`api.ts` 不再负责从 posts 中反复构建 tag/month/prev-next 等派生数据。这些数据由 Rust 编译器在生成阶段产出。`api.ts` 只负责：

- 按 locale 选择 manifest。
- 按 id/tag/month 做 Map 查找。
- 分页。
- 加载完整文章模块。
- 校验 draft/hidden 访问规则。
- 读取 SSG 注入的 initial post。

建议公开 API：

```ts
export function getAllPosts(locale: Locale, options?: PostQueryOptions): PostData[];
export function getAllTags(locale: Locale): TagCount[];
export function getPostsByTag(locale: Locale, tagName: string): PostData[];
export function getAllPostIds(locale: Locale): PostPathData[];
export function getPostById(locale: Locale, id: string): PostData & PostNavigation;
export function loadPostById(locale: Locale, id: string): Promise<PostData & PostNavigation>;
export function prefetchPostById(locale: Locale, id: string): Promise<void>;
export function getLoadedPostById(locale: Locale, id: string): (PostData & PostNavigation) | undefined;
export function getAllMonths(locale: Locale): MonthData[];
export function getPostsByMonth(locale: Locale, month: string): PostData[];
export function getAllPostsWithPagination(locale: Locale, page?: number, pageSize?: number): PaginatedPosts;
export function getPostsByTagWithPagination(locale: Locale, tagName: string, page?: number, pageSize?: number): PaginatedPosts;
export function getPostsByMonthWithPagination(locale: Locale, month: string, page?: number, pageSize?: number): PaginatedPosts;
```

内部索引可以基于生成产物构建轻量 Map：

```ts
const contentByLocale: Record<Locale, LocaleContentIndex> = {
  zh: createRuntimeLocaleIndex(generatedContentByLocale.zh),
  en: createRuntimeLocaleIndex(generatedContentByLocale.en),
};
```

关键行为：

- `prevPost` 和 `nextPost` 来自 Rust 预计算结果，只在同一 locale 内存在。
- 标签来自 Rust 预计算结果，只包含同一 locale 的文章。
- 月份归档来自 Rust 预计算结果，只包含同一 locale 的文章。
- 搜索只使用同一 locale 的索引。
- `readInitialPostFromDocument` 必须同时校验 `id` 和 `locale`。

## 路由设计

当前 route tree 只定义了无前缀路由。新方案应该渲染两棵同构子路由：

- 中文挂在 `/`。
- 英文挂在 `/en`。

建议 route shape：

```tsx
return [
  {
    path: '/',
    element: <RootLayout locale="zh" />,
    children: createLocalizedChildren(pageRoutes, 'zh'),
  },
  {
    path: '/en',
    element: <RootLayout locale="en" />,
    children: createLocalizedChildren(pageRoutes, 'en'),
  },
];
```

`createLocalizedChildren` 复用当前子路由结构：

```tsx
[
  { index: true, element: <HomeRoute locale={locale} /> },
  { path: 'about', element: <AboutRoute locale={locale} /> },
  { path: 'blog', element: <BlogIndexRoute locale={locale} /> },
  { path: 'blog/page/:page', element: <BlogPaginationRoute locale={locale} /> },
  { path: 'blog/:slug', element: <BlogPostRoute locale={locale} /> },
  { path: 'tags', element: <TagsIndexRoute locale={locale} /> },
  { path: 'tags/:tag', element: <TagRoute locale={locale} /> },
  { path: 'tags/:tag/page/:page', element: <TagPaginationRoute locale={locale} /> },
  { path: 'archive', element: <ArchiveIndexRoute locale={locale} /> },
  { path: 'archive/:month', element: <MonthArchiveRoute locale={locale} /> },
  { path: 'archive/:month/page/:page', element: <MonthArchivePaginationRoute locale={locale} /> },
  { path: 'search', element: <SearchRoute locale={locale} /> },
  { path: '*', element: <NotFoundRoute locale={locale} /> },
]
```

这样不需要在 `src/app` 下复制一套 `en` 页面文件。

## 页面组件改造

当前页面组件调用数据 API 时不传 locale。改造后由 route wrapper 把 `locale` 通过 props 传给页面组件。

示例：

```tsx
export function BlogPostRoute({ locale }: { locale: Locale }) {
  const { slug = '' } = useParams();
  return withSuspense(<BlogPostPage locale={locale} params={{ slug }} />);
}
```

页面中调用 locale-aware API：

```tsx
const { posts, totalPages } = getAllPostsWithPagination(locale, currentPage);
const post = getPostById(locale, slug);
const months = getAllMonths(locale);
```

需要翻译的静态 UI 从 dictionary 读取：

```ts
const t = dictionaries[locale];
```

## UI 文案字典

建议先不要引入完整 i18n 框架，增加一个轻量字典模块：

```txt
packages/site/src/lib/i18n.ts
```

建议结构：

```ts
export const dictionaries = {
  zh: {
    siteName: 'Elecmonkey的小花园',
    nav: {
      home: '首页',
      blog: '所有文章',
      about: '关于我',
      search: '搜索',
    },
    archive: {
      title: '文章归档',
      subtitle: '按时间排序',
      postUnit: '篇',
      empty: '暂无文章',
    },
  },
  en: {
    siteName: "Elecmonkey's Garden",
    nav: {
      home: 'Home',
      blog: 'Posts',
      about: 'About',
      search: 'Search',
    },
    archive: {
      title: 'Archive',
      subtitle: 'Browse by month',
      postUnit: 'posts',
      empty: 'No posts yet',
    },
  },
} satisfies Record<Locale, Dictionary>;
```

第一批覆盖这些页面和组件：

- 首页
- 文章列表
- 文章详情标签
- 标签页
- 归档页
- 搜索页
- Navbar/Footer
- Not found

## 链接生成

当前有大量硬编码内部链接，例如 `/blog`、`/archive`、`/search`、`/tags/foo`。它们需要 locale-aware。

建议增加 helper：

```ts
function hrefFor(locale: Locale, path: string): string;
function postHref(locale: Locale, slug: string): string;
function tagHref(locale: Locale, tag: string): string;
function archiveHref(locale: Locale, month: string): string;
```

规则：

- `hrefFor('zh', '/blog')` 返回 `/blog`。
- `hrefFor('en', '/blog')` 返回 `/en/blog`。
- `hrefFor('en', '/')` 返回 `/en`。

需要改造的组件：

- `Navbar`
- `PostCard`
- `BlogIndexContent`
- `TagCloud`
- `TagList`
- `ArchiveIndexPage`
- `MonthArchiveContent`
- `Pagination` / `PathPagination`
- 文章上一篇/下一篇链接
- 搜索结果链接

`Link` 组件本身可以基本不变，由调用方传入已经本地化的 href。

## 搜索设计

当前客户端搜索读取一个索引：

```ts
fetch('/static/search/index.json')
```

改成：

```ts
fetch(`/static/search/${locale}/index.json`)
```

建议 API：

```ts
export function loadSearchIndexPosts(locale: Locale): Promise<SearchIndexPost[]>;
export function prefetchSearchIndexPosts(locale: Locale): Promise<void>;
export function searchIndexPosts(keyword: string, allPosts: SearchIndexPost[]): SearchResult[];
```

搜索索引缓存按 locale 拆分：

```ts
const searchIndexPostsPromises = new Map<Locale, Promise<SearchIndexPost[]>>();
const loadedSearchIndexPosts = new Map<Locale, SearchIndexPost[]>();
```

`ClientSearchPage` 接收 `locale` 和字典文案。

## 归档设计

归档数据通过 locale-aware API 自然隔离，并由 Rust 侧预计算。

月份显示可以保持数字化，也可以本地化：

- 中文：`2026年05月`
- 英文：`May 2026`

建议在 Rust 侧统一计算并写入 manifest：

```ts
type MonthData = {
  id: string;
  displayName: string;
  count: number;
};
```

这样归档页面组件和 `api.ts` 都不需要知道格式化细节。

## 标签设计

标签按语言隔离。英文标签不需要和中文标签一一对应。

tag count 由 Rust 侧预计算。TS 侧只负责根据 tag name 查找对应文章列表和分页。

URL 编码可以复用当前 `tag-url.ts`。路径前缀由 locale helper 处理：

```ts
hrefFor(locale, getTagPath(tagName))
```

这样 `tag-url.ts` 继续只负责 tag 编码，不负责 locale。

## Metadata 和 SEO

`renderMetadataTags(pathname)` 需要先从 pathname 推导 locale，再调用 locale-aware metadata 逻辑。

需要支持：

- `<html lang>`。
- 每个 locale 自己的 canonical URL。
- 有对应页面时输出 `hreflang` alternate。
- 搜索页和隐藏文章的 robots 策略。

最小可交付 SEO：

- 中文页面 canonical 保持无 `/zh`。
- 英文页面 canonical 带 `/en`。
- 所有页面输出对应语言的 title 和 description。
- hidden post 继续使用 `noindex, nofollow`。
- `/search` 和 `/en/search` 使用 `noindex, follow`，并且不放入 sitemap。

canonical 规则：

- 每个语言版本 canonical 指向自己，不把英文 canonical 到中文。
- 中文文章示例：`https://www.elecmonkey.com/blog/foo`。
- 英文文章示例：`https://www.elecmonkey.com/en/blog/foo`。
- 这是为了避免把翻译页误标记成重复页的次级 URL。

文章页 alternate 示例：

```html
<link rel="canonical" href="https://www.elecmonkey.com/en/blog/foo" />
<link rel="alternate" hreflang="zh-CN" href="https://www.elecmonkey.com/blog/foo" />
<link rel="alternate" hreflang="en" href="https://www.elecmonkey.com/en/blog/foo" />
<link rel="alternate" hreflang="x-default" href="https://www.elecmonkey.com/blog/foo" />
```

`hreflang` 规则：

- alternate URL 使用绝对 URL。
- 每个语言版本都列出自己和其它存在的语言版本。
- 中英文必须双向声明：中文页指向英文页，英文页也指回中文页。
- `x-default` 指向中文默认 URL。
- 文章页只有在两个 locale 都存在同 slug 时才输出对应 alternate。
- 首页、文章列表、归档首页、标签首页可以直接输出中英文 alternate。
- tag 详情页如果中英文 tag 不一一对应，第一版不输出 alternate。

`src/index.html` 当前只有一个模板。SSG 需要能替换或注入 `lang`：

```html
<html lang="zh-CN">
```

对 `/en` 路径替换成 `lang="en"`。

不要根据 `Accept-Language` 或浏览器语言自动把 `/` 跳转到 `/en`。语言选择应由 URL 和显式语言切换链接决定，避免 crawler 和用户显式选择被自动跳转干扰。

## Sitemap 和 Robots

`writeSitemapXml` 需要包含两个 locale 的 URL。

需要包含：

- 中文静态页面。
- 英文静态页面。
- 中文公开文章。
- 英文公开文章。
- 中文和英文标签页。
- 中文和英文归档页。

hidden post 继续排除。

文章 `lastmod` 使用文章自己的 `date`。静态页和列表页可以继续使用构建时间。未来如果 frontmatter 支持 `updated`，文章页 `lastmod` 应优先使用 `updated`。

sitemap 需要使用绝对 URL，并且可以为有对应语言版本的页面写入 `xhtml:link` alternate：

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.elecmonkey.com/blog/foo</loc>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://www.elecmonkey.com/blog/foo" />
    <xhtml:link rel="alternate" hreflang="en" href="https://www.elecmonkey.com/en/blog/foo" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.elecmonkey.com/blog/foo" />
    <lastmod>2026-05-30T00:00:00.000Z</lastmod>
  </url>
</urlset>
```

Google 会忽略 sitemap 中的 `priority` 和 `changefreq`，第一版不需要输出。

不建议用 `robots.txt` 阻止需要读取 `noindex` 的页面。如果搜索页不希望被索引，优先在页面 metadata 输出：

```html
<meta name="robots" content="noindex, follow" />
```

如果仍然保留 robots 规则，也要覆盖英文路径：

```txt
Disallow: /search
Disallow: /en/search
```

## SSG 路径生成

`getStaticPathnames()` 应该为每个 locale 生成路径。

建议结构：

```ts
export async function getStaticPathnames(): Promise<string[]> {
  const paths = new Set<string>();

  for (const locale of locales) {
    addLocaleStaticPaths(paths, locale);
  }

  return Array.from(paths).map(normalizePathname).sort();
}
```

`addLocaleStaticPaths` 使用 locale-aware API 和 `hrefFor`。这里使用的是 Rust 已经预计算好的 `publicPosts`、`tags`、`months`，TS 侧只根据 route 规则拼路径和计算分页数量。

基础路径：

- `zh`: `/`、`/about`、`/blog`、`/tags`、`/archive`、`/search`
- `en`: `/en`、`/en/about`、`/en/blog`、`/en/tags`、`/en/archive`、`/en/search`

文章路径：

- `zh`: `/blog/:slug`
- `en`: `/en/blog/:slug`

分页路径同理加 locale 前缀。

## 初始文章注入

当前 SSG 文章页会把完整文章 JSON 注入 HTML：

```html
<script id="__garden_initial_post__" type="application/json">...</script>
```

注入的 JSON 应该包含 `locale`。客户端读取时必须同时匹配：

```ts
existing.locale === locale && existing.id === id
```

`render-page.ts` 需要识别两种文章路径：

- `/blog/:slug`
- `/en/blog/:slug`

然后调用：

```ts
loadPostById(locale, slug)
```

## Prefetch

`client-prefetch.ts` 需要从 href 推导 locale，并预取对应语言的内容。

文章预取改成：

```ts
prefetchPostById(locale, slug)
```

搜索预取改成：

```ts
prefetchSearchIndexPosts(locale)
```

路由 chunk 可以继续共享，因为中英文复用同一套页面组件。

## 语言切换器

在 `Navbar` 中增加一个轻量语言切换器。

行为：

- 中文路由切到英文时加 `/en`。
- 英文路由切到中文时去掉 `/en`。
- 文章页如果目标 locale 不存在同 slug，回退到目标语言的文章列表页。
- 标签页如果目标 locale 不存在同 tag，回退到目标语言的标签首页。
- 归档页如果目标 locale 没有同月份文章，回退到目标语言的归档首页。

最小可行版本可以先只做路径前缀映射：

- `/blog/foo` -> `/en/blog/foo`
- `/en/blog/foo` -> `/blog/foo`

但上线前建议做存在性检查，避免切换到 404。

## 实施计划

这部分是实施前计划，不代表立即开始改造。实际动手前先确保依赖切到 workspace、本地编译器可直接联调、英文内容目录和翻译策略明确。

### Phase 0: 测试期依赖切换

测试期间，站点直接依赖 workspace 内的编译器包，避免每次改 Rust/N-API 后都必须先发布 npm 包。

`packages/site/package.json` 中：

```json
{
  "dependencies": {
    "@elecmonkey/garden-content-compiler": "workspace:*"
  }
}
```

这样可以在同一个 pnpm workspace 内直接联调：

- `crates/content-compiler`
- `crates/md-compiler`
- `packages/content-compiler-napi`
- `packages/site`

等双语能力稳定后，再决定是否重新发布 `@elecmonkey/garden-content-compiler`。

### Phase 1: 英文内容初始化和翻译

在开始代码层 i18n 改造前，先准备英文内容目录和翻译规则。

目标目录：

```txt
content/en/posts
```

处理规则：

- 遍历所有现有中文文章 `content/posts/**/*.md`。
- 在 `content/en/posts` 下保持相同的月份目录结构。
- 英文文件名默认保持同 slug，方便 `/blog/foo` 和 `/en/blog/foo` 建立自然对应关系。
- 翻译 frontmatter 中适合翻译的字段：`title`、`description`、`tags`。
- `date` 保持不变。
- `author` 默认保持 `Elecmonkey`。
- `draft-` 和 `hidden-` 前缀保持不变。
- 正文翻译成英文。
- 每篇英文正文最前面添加引用声明：

```md
> This article was translated by AI and has not been manually reviewed.
```

声明位置：

- 放在 frontmatter 结束后的正文第一段之前。
- 如果正文原本以标题开始，声明仍然放在标题之前。
- 声明不写入 frontmatter。

示例：

```md
---
title: 'Example Article'
date: '2026-05-01'
description: 'Example description.'
tags: ['Frontend', 'React']
author: 'Elecmonkey'
---

> This article was translated by AI and has not been manually reviewed.

Article body...
```

翻译质量策略：

- 第一轮允许 AI 批量翻译，不做逐篇人工校对。
- 代码块、命令、URL、包名、API 名称、错误日志尽量保持原文。
- Markdown 链接的 URL 保持不变，链接文本翻译。
- Mermaid、数学公式、代码 fence info 不翻译。
- 专有名词优先保留英文原名，例如 React、Vite、Rolldown、TypeScript。
- 中文语境下的术语可以翻译但保留必要英文，例如“供应链安全 / supply chain security”。
- 如果翻译不确定，保守保留原文关键名词。

验收标准：

- `content/en/posts` 覆盖所有当前 `content/posts` 中非 draft 文章。
- hidden 文章也复制并翻译，但仍保持 `hidden-` 前缀。
- 每篇英文正文都有 AI 翻译声明。
- frontmatter YAML/数组格式可被现有 parser 解析。
- 不修改原中文文章。

### Phase 2: Rust multi-locale manifest

改造 Rust `content-compiler`，支持 `compileSite` / multi-locale manifest。

Rust 侧负责预计算：

- locale manifest
- public posts
- prev/next
- tags
- months
- search index
- permalink
- cache metadata

输出结构需要天然支持：

- `zh` 不带 URL prefix。
- `en` 使用 `/en` prefix。
- 中英文同 slug 不冲突。
- cache 按 locale 隔离。

### Phase 3: N-API 和 Rsbuild 插件

改造 `@elecmonkey/garden-content-compiler` N-API 和 JS 插件，调用新的 Rust multi-locale 编译接口，并把 multi-locale manifest 写成 TS/JSON 产物。

更新生成产物：

- locale-aware content manifest
- locale-specific post modules
- locale-specific search index JSON

更新 `rsbuild.config.ts`，让 `en` 指向 `../../content/en/posts`。

### Phase 4: Locale 基础设施

新增 `src/lib/i18n.ts`，包含 locale 类型、字典、路径 helper、路由 helper。

改造路由，渲染中英文两棵同构路由树：

- `create-routes.tsx`
- `PageRoutes.client.tsx`
- `PageRoutes.ssg.tsx`
- `RootLayout.tsx`

### Phase 5: 内容 API

重构 `src/lib/api.ts`，所有数据访问方法都接收 locale。

确保导航、标签、月份、分页、hidden post、初始文章 hydration 都按 locale 隔离。`api.ts` 不再重复 reduce 全量 posts 来生成 tag/month/prev-next。

### Phase 6: 页面和组件

从 route wrapper 向页面组件传入 `locale`。

把硬编码 UI 文案替换成 dictionary：

- 首页
- 文章列表
- 文章详情
- 标签页
- 归档页
- 搜索页
- Navbar/Footer
- Not found

把硬编码内部 href 替换成 locale-aware href helper。

### Phase 7: SSG 和 SEO

更新：

- `static-paths.ts`
- `render-page.ts`
- `metadata.ts`
- `build.ts` 中 sitemap、robots、search index copy 逻辑

确保 `/en` 页面可以生成，并且有英文 metadata。

### Phase 8: Prefetch 和搜索

更新：

- `client-prefetch.ts`
- `search.ts`
- `ClientSearchPage`
- 搜索结果卡片

确认英文搜索只读取 `/static/search/en/index.json`。

### Phase 9: 验证和发布

验证完成后再考虑重新发布编译器包，并把站点依赖从 `workspace:*` 改回具体版本。

发布前确认：

- 中文现有 URL 不变。
- 英文 `/en` 全量静态页面生成正常。
- 中英文搜索、归档、标签、文章详情互相隔离。
- sitemap 和 metadata 正确。

## 兼容和迁移说明

最稳妥的迁移方式是先保证中文输出尽量不变，再增加英文路径。

不要移动现有中文内容，也不要改中文 slug。

第一版不要创建 `/zh` 路由。之后如果需要，可以用 redirect 或 alias 添加，但那会增加 canonical URL 复杂度。

内容编译器可以做破坏性升级，因为当前主要由本站使用。迁移期间可以直接更新站点配置并重新发布 `@elecmonkey/garden-content-compiler`。

## 测试清单

实现后检查：

- `pnpm lint`
- `pnpm build`
- `/` 渲染中文首页。
- `/en` 渲染英文首页。
- `/blog` 只列出中文文章。
- `/en/blog` 只列出英文文章。
- `/archive` 和 `/en/archive` 的月份统计互相独立。
- `/search` 读取 `/static/search/zh/index.json`。
- `/en/search` 读取 `/static/search/en/index.json`。
- `/blog/:slug` 和 `/en/blog/:slug` 加载对应 locale 的文章模块。
- 上一篇/下一篇链接不跨语言。
- sitemap 包含中英文公开 URL。
- hidden post 不进入公开列表和 sitemap。
- 页面 metadata 的语言、title、canonical 正确。

## 主要风险点

- 中英文同 slug 时生成模块文件名冲突。
- 硬编码链接把英文用户带回中文页面。
- `api.ts` 或 `search.ts` 的全局缓存返回错误 locale 的数据。
- SSG metadata 没有先剥离 `/en`，导致路由参数解析错误。
- 语言切换器链接到目标语言不存在的文章、标签或月份页面。
- 搜索索引复制路径和运行时 fetch URL 不一致。
