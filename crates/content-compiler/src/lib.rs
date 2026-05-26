//! Garden content compiler core.
//!
//! The compiler owns Markdown/frontmatter/content-index preprocessing. React
//! and Rsbuild still own routing, layout, hydration, and final page rendering.

use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

const DRAFT_PREFIX: &str = "draft-";
const HIDDEN_PREFIX: &str = "hidden-";

#[derive(Debug)]
pub enum CompileError {
    Io(std::io::Error),
    InvalidFrontmatter { path: PathBuf, message: String },
}

impl std::fmt::Display for CompileError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CompileError::Io(error) => write!(f, "{error}"),
            CompileError::InvalidFrontmatter { path, message } => {
                write!(f, "invalid frontmatter in {}: {message}", path.display())
            }
        }
    }
}

impl std::error::Error for CompileError {}

impl From<std::io::Error> for CompileError {
    fn from(error: std::io::Error) -> Self {
        CompileError::Io(error)
    }
}

pub type CompileResult<T> = Result<T, CompileError>;

#[derive(Debug, Clone)]
pub struct CompileOptions {
    pub posts_dir: PathBuf,
}

#[derive(Debug, Clone)]
pub struct ContentManifest {
    pub posts: Vec<Post>,
    pub public_posts: Vec<Post>,
}

#[derive(Debug, Clone)]
pub struct Post {
    pub id: String,
    pub content: String,
    pub search_content: String,
    pub month_folder: String,
    pub is_draft: bool,
    pub is_hidden: bool,
    pub title: String,
    pub date: String,
    pub description: String,
    pub tags: Vec<String>,
    pub author: String,
    pub no_toc: Option<bool>,
    pub toc: Vec<TocItem>,
    pub extra: BTreeMap<String, FrontmatterValue>,
}

#[derive(Debug, Clone)]
pub struct TocItem {
    pub id: String,
    pub text: String,
    pub level: u8,
}

#[derive(Debug, Clone)]
pub enum FrontmatterValue {
    String(String),
    Bool(bool),
    Array(Vec<String>),
}

pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

pub fn compile_content(options: CompileOptions) -> CompileResult<ContentManifest> {
    let mut month_folders = read_month_folders(&options.posts_dir)?;
    month_folders.sort();
    month_folders.reverse();

    let mut posts = Vec::new();
    for month_folder in month_folders {
        posts.extend(read_posts_from_month(&options.posts_dir, &month_folder)?);
    }

    posts.sort_by(|a, b| b.date.cmp(&a.date));
    let public_posts = posts
        .iter()
        .filter(|post| !post.is_hidden)
        .cloned()
        .collect();

    Ok(ContentManifest {
        posts,
        public_posts,
    })
}

pub fn compile_post_file(path: &Path, month_folder: &str) -> CompileResult<Option<Post>> {
    let Some(file_name) = path.file_name().and_then(|file_name| file_name.to_str()) else {
        return Ok(None);
    };

    if !file_name.ends_with(".md") || is_draft_file(file_name) {
        return Ok(None);
    }

    read_post_file(path, month_folder, file_name).map(Some)
}

fn read_month_folders(posts_dir: &Path) -> CompileResult<Vec<String>> {
    let mut folders = Vec::new();
    for entry in fs::read_dir(posts_dir)? {
        let entry = entry?;
        if !entry.file_type()?.is_dir() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        if name.len() == 6 && name.chars().all(|ch| ch.is_ascii_digit()) {
            folders.push(name);
        }
    }
    Ok(folders)
}

fn read_posts_from_month(posts_dir: &Path, month_folder: &str) -> CompileResult<Vec<Post>> {
    let month_path = posts_dir.join(month_folder);
    let mut posts = Vec::new();

    for entry in fs::read_dir(&month_path)? {
        let entry = entry?;
        if !entry.file_type()?.is_file() {
            continue;
        }

        let file_name = entry.file_name().to_string_lossy().to_string();
        if !file_name.ends_with(".md") || is_draft_file(&file_name) {
            continue;
        }

        posts.push(read_post_file(&entry.path(), month_folder, &file_name)?);
    }

    Ok(posts)
}

fn read_post_file(path: &Path, month_folder: &str, file_name: &str) -> CompileResult<Post> {
    let source = fs::read_to_string(path)?;
    let (frontmatter, content) = parse_markdown_file(path, &source)?;
    let id = extract_id_from_file_name(file_name);
    let toc = extract_toc(content);

    Ok(Post {
        id,
        content: content.to_string(),
        search_content: normalize_search_content(content),
        month_folder: month_folder.to_string(),
        is_draft: false,
        is_hidden: is_hidden_file(file_name),
        title: frontmatter.get_string("title"),
        date: frontmatter.get_string("date"),
        description: frontmatter.get_string("description"),
        tags: frontmatter.get_array("tags"),
        author: frontmatter.get_string("author"),
        no_toc: frontmatter.get_bool("no_toc"),
        toc,
        extra: frontmatter.extra,
    })
}

fn parse_markdown_file<'a>(path: &Path, source: &'a str) -> CompileResult<(Frontmatter, &'a str)> {
    let Some(rest) = source.strip_prefix("---") else {
        return Ok((Frontmatter::default(), source));
    };

    let rest = rest
        .strip_prefix("\r\n")
        .or_else(|| rest.strip_prefix('\n'))
        .unwrap_or(rest);
    let Some(end) = rest.find("\n---") else {
        return Err(CompileError::InvalidFrontmatter {
            path: path.to_path_buf(),
            message: "missing closing delimiter".to_string(),
        });
    };

    let raw = &rest[..end];
    let mut content = &rest[end + "\n---".len()..];
    content = content
        .strip_prefix("\r\n")
        .or_else(|| content.strip_prefix('\n'))
        .unwrap_or(content);
    let frontmatter = parse_frontmatter(path, raw)?;

    Ok((frontmatter, content))
}

#[derive(Default)]
struct Frontmatter {
    values: BTreeMap<String, FrontmatterValue>,
    extra: BTreeMap<String, FrontmatterValue>,
}

impl Frontmatter {
    fn get_string(&self, key: &str) -> String {
        match self.values.get(key) {
            Some(FrontmatterValue::String(value)) => value.clone(),
            Some(FrontmatterValue::Bool(value)) => value.to_string(),
            Some(FrontmatterValue::Array(values)) => values.join(", "),
            None => String::new(),
        }
    }

    fn get_bool(&self, key: &str) -> Option<bool> {
        match self.values.get(key) {
            Some(FrontmatterValue::Bool(value)) => Some(*value),
            Some(FrontmatterValue::String(value)) => match value.as_str() {
                "true" => Some(true),
                "false" => Some(false),
                _ => None,
            },
            _ => None,
        }
    }

    fn get_array(&self, key: &str) -> Vec<String> {
        match self.values.get(key) {
            Some(FrontmatterValue::Array(values)) => values.clone(),
            Some(FrontmatterValue::String(value)) if !value.is_empty() => vec![value.clone()],
            _ => Vec::new(),
        }
    }
}

fn parse_frontmatter(path: &Path, raw: &str) -> CompileResult<Frontmatter> {
    let mut frontmatter = Frontmatter::default();

    for (line_index, line) in raw.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        let Some((key, value)) = trimmed.split_once(':') else {
            return Err(CompileError::InvalidFrontmatter {
                path: path.to_path_buf(),
                message: format!("line {} is not a key/value pair", line_index + 1),
            });
        };

        let key = key.trim().to_string();
        let value = parse_frontmatter_value(value.trim());
        if !matches!(
            key.as_str(),
            "title" | "date" | "description" | "tags" | "author" | "no_toc"
        ) {
            frontmatter.extra.insert(key.clone(), value.clone());
        }
        frontmatter.values.insert(key, value);
    }

    Ok(frontmatter)
}

fn parse_frontmatter_value(value: &str) -> FrontmatterValue {
    if value == "true" {
        return FrontmatterValue::Bool(true);
    }
    if value == "false" {
        return FrontmatterValue::Bool(false);
    }

    if value.starts_with('[') && value.ends_with(']') {
        return FrontmatterValue::Array(parse_inline_array(&value[1..value.len() - 1]));
    }

    FrontmatterValue::String(unquote(value))
}

fn parse_inline_array(value: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut current = String::new();
    let mut quote: Option<char> = None;
    let mut escape = false;

    for ch in value.chars() {
        if escape {
            current.push(ch);
            escape = false;
            continue;
        }

        if ch == '\\' {
            escape = true;
            current.push(ch);
            continue;
        }

        if matches!(quote, Some(q) if q == ch) {
            quote = None;
            current.push(ch);
            continue;
        }

        if quote.is_none() && (ch == '\'' || ch == '"') {
            quote = Some(ch);
            current.push(ch);
            continue;
        }

        if quote.is_none() && ch == ',' {
            let item = unquote(current.trim());
            if !item.is_empty() {
                result.push(item);
            }
            current.clear();
            continue;
        }

        current.push(ch);
    }

    let item = unquote(current.trim());
    if !item.is_empty() {
        result.push(item);
    }

    result
}

fn unquote(value: &str) -> String {
    let trimmed = value.trim();
    if trimmed.len() >= 2 {
        let first = trimmed.as_bytes()[0] as char;
        let last = trimmed.as_bytes()[trimmed.len() - 1] as char;
        if (first == '"' && last == '"') || (first == '\'' && last == '\'') {
            return trimmed[1..trimmed.len() - 1]
                .replace("\\\"", "\"")
                .replace("\\'", "'");
        }
    }
    trimmed.to_string()
}

fn normalize_search_content(content: &str) -> String {
    let without_fenced_code = replace_fenced_code_blocks(content);
    let without_inline_code = unwrap_inline_code(&without_fenced_code);
    let without_html_tags = replace_html_tags(&without_inline_code);
    collapse_search_whitespace(&without_html_tags)
}

fn replace_fenced_code_blocks(content: &str) -> String {
    let mut result = String::new();
    let chars = content.chars().collect::<Vec<_>>();
    let mut index = 0;

    while index < chars.len() {
        if has_backtick_fence_at(&chars, index) {
            if let Some(end_index) = find_closing_backtick_fence(&chars, index + 3) {
                result.push(' ');
                index = end_index + 3;
                continue;
            }
        }

        result.push(chars[index]);
        index += 1;
    }

    result
}

fn unwrap_inline_code(content: &str) -> String {
    let mut result = String::new();
    let chars = content.chars().collect::<Vec<_>>();
    let mut index = 0;

    while index < chars.len() {
        if chars[index] == '`' {
            if let Some(end_index) = find_closing_inline_backtick(&chars, index + 1) {
                result.extend(chars[index + 1..end_index].iter());
                index = end_index + 1;
                continue;
            }
        }

        result.push(chars[index]);
        index += 1;
    }

    result
}

fn replace_html_tags(content: &str) -> String {
    let mut result = String::new();
    let chars = content.chars().collect::<Vec<_>>();
    let mut index = 0;

    while index < chars.len() {
        if chars[index] == '<' {
            if let Some(end_index) = find_html_tag_end(&chars, index + 1) {
                result.push(' ');
                index = end_index + 1;
                continue;
            }
        }

        result.push(chars[index]);
        index += 1;
    }

    result
}

fn collapse_search_whitespace(content: &str) -> String {
    let mut result = String::new();
    let mut pending_space = false;

    for ch in content.chars() {
        push_search_char(&mut result, ch, &mut pending_space);
    }

    result
}

fn has_backtick_fence_at(chars: &[char], index: usize) -> bool {
    matches!(chars.get(index..index + 3), Some(['`', '`', '`']))
}

fn find_closing_backtick_fence(chars: &[char], start: usize) -> Option<usize> {
    (start..chars.len()).find(|&index| has_backtick_fence_at(chars, index))
}

fn find_closing_inline_backtick(chars: &[char], start: usize) -> Option<usize> {
    if chars.get(start) == Some(&'`') {
        return None;
    }
    (start..chars.len()).find(|&index| chars[index] == '`')
}

fn find_html_tag_end(chars: &[char], start: usize) -> Option<usize> {
    (start..chars.len()).find(|&index| chars[index] == '>')
}

fn push_search_char(result: &mut String, ch: char, pending_space: &mut bool) {
    if ch.is_whitespace() || is_search_separator(ch) {
        *pending_space = true;
        return;
    }

    if *pending_space && !result.is_empty() {
        result.push(' ');
    }
    *pending_space = false;
    result.push(ch);
}

fn is_search_separator(ch: char) -> bool {
    matches!(
        ch,
        '[' | ']' | '(' | ')' | '*' | '_' | '>' | '#' | '~' | '-'
    )
}

fn extract_toc(content: &str) -> Vec<TocItem> {
    let mut toc = Vec::new();

    for line in content.lines() {
        let Some((level, text)) = parse_heading_line(line) else {
            continue;
        };
        if !(2..=6).contains(&level) {
            continue;
        }
        toc.push(TocItem {
            id: heading_id(text),
            text: strip_inline_markdown(text).trim().to_string(),
            level,
        });
    }

    toc
}

fn parse_heading_line(line: &str) -> Option<(u8, &str)> {
    let trimmed = line.trim_start();
    let level = trimmed.chars().take_while(|ch| *ch == '#').count();
    if level == 0 || level > 6 {
        return None;
    }
    let rest = &trimmed[level..];
    if !rest.starts_with(' ') {
        return None;
    }
    Some((level as u8, rest.trim()))
}

fn heading_id(text: &str) -> String {
    strip_inline_markdown(text)
        .to_lowercase()
        .replace(char::is_whitespace, "-")
}

fn strip_inline_markdown(text: &str) -> String {
    let mut result = String::new();
    let mut chars = text.chars().peekable();

    while let Some(ch) = chars.next() {
        match ch {
            '#' | '*' | '_' | '`' => {}
            '[' => {
                let mut label = String::new();
                for next in chars.by_ref() {
                    if next == ']' {
                        break;
                    }
                    label.push(next);
                }
                if matches!(chars.peek(), Some('(')) {
                    for next in chars.by_ref() {
                        if next == ')' {
                            break;
                        }
                    }
                }
                result.push_str(&label);
            }
            _ => result.push(ch),
        }
    }

    result.trim().trim_end_matches('#').trim().to_string()
}

fn is_draft_file(file_name: &str) -> bool {
    file_name.starts_with(DRAFT_PREFIX)
}

fn is_hidden_file(file_name: &str) -> bool {
    file_name.starts_with(HIDDEN_PREFIX)
}

fn extract_id_from_file_name(file_name: &str) -> String {
    let mut id = file_name.strip_suffix(".md").unwrap_or(file_name);
    if let Some(rest) = id.strip_prefix(DRAFT_PREFIX) {
        id = rest;
    }
    if let Some(rest) = id.strip_prefix(HIDDEN_PREFIX) {
        id = rest;
    }
    id.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_toc_with_current_heading_id_rule() {
        let toc = extract_toc(
            "# Title\n\n## My View\n### 功能覆盖\n#### `code` and [link](https://example.com)\n",
        );
        assert_eq!(toc.len(), 3);
        assert_eq!(toc[0].id, "my-view");
        assert_eq!(toc[0].text, "My View");
        assert_eq!(toc[1].id, "功能覆盖");
        assert_eq!(toc[2].id, "code-and-link");
    }

    #[test]
    fn parses_inline_frontmatter_array() {
        let tags = parse_inline_array("\"React\", 'Web 安全', CI/CD");
        assert_eq!(tags, vec!["React", "Web 安全", "CI/CD"]);
    }

    #[test]
    fn normalizes_search_content_like_previous_js_pipeline() {
        let content = "## Hello World\n\n```ts\nconst a = 1;\n```\nUse `React` and [Link](https://example.com).\n<div>HTML</div>\npull-request-target";
        assert_eq!(
            normalize_search_content(content),
            "Hello World Use React and Link https://example.com . HTML pull request target",
        );
    }

    #[test]
    fn replaces_inline_fenced_code_with_space_for_search() {
        assert_eq!(normalize_search_content("a```code```b"), "a b");
    }

    #[test]
    fn preserves_unmatched_backticks_like_previous_js_pipeline() {
        assert_eq!(
            normalize_search_content("call run` method"),
            "call run` method"
        );
    }

    #[test]
    fn removes_html_like_inline_code_after_unwrapping_for_search() {
        assert_eq!(
            normalize_search_content("`Option<extern \"C\" fn(...)>`，支持空指针情况。"),
            "Option ，支持空指针情况。"
        );
        assert_eq!(
            normalize_search_content("它暂不支持 `<Transition>`、`<KeepAlive>` 与 SSR"),
            "它暂不支持 、 与 SSR"
        );
        assert_eq!(
            normalize_search_content("包括 `<!--ssr-outlet-->` 占位符"),
            "包括 占位符"
        );
        assert_eq!(
            normalize_search_content("HTML 中 `<a>` 标签的行为有关。"),
            "HTML 中 标签的行为有关。"
        );
    }

    #[test]
    fn preserves_unclosed_html_like_previous_js_pipeline() {
        assert_eq!(normalize_search_content("keep <unclosed text"), "keep <unclosed text");
    }
}
