use std::fs;
use std::path::{Path, PathBuf};

use garden_md_compiler::compile_markdown;
use rayon::prelude::*;

use crate::frontmatter::parse_markdown_file;
use crate::search::normalize_search_content;
use crate::{CompileOptions, CompileResult, ContentManifest, Post};

const DRAFT_PREFIX: &str = "draft-";
const HIDDEN_PREFIX: &str = "hidden-";

#[derive(Debug)]
struct PostFile {
    path: PathBuf,
    month_folder: String,
    file_name: String,
}

pub fn compile_content(options: CompileOptions) -> CompileResult<ContentManifest> {
    let post_files = read_post_files(&options.posts_dir)?;
    let mut posts = post_files
        .par_iter()
        .map(|post_file| {
            read_post_file(
                &post_file.path,
                &post_file.month_folder,
                &post_file.file_name,
            )
        })
        .collect::<Vec<_>>()
        .into_iter()
        .collect::<CompileResult<Vec<_>>>()?;

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

fn read_post_files(posts_dir: &Path) -> CompileResult<Vec<PostFile>> {
    let mut month_folders = read_month_folders(posts_dir)?;
    month_folders.sort();
    month_folders.reverse();

    let mut post_files = Vec::new();
    for month_folder in month_folders {
        post_files.extend(read_post_files_from_month(posts_dir, &month_folder)?);
    }

    Ok(post_files)
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

fn read_post_files_from_month(
    posts_dir: &Path,
    month_folder: &str,
) -> CompileResult<Vec<PostFile>> {
    let month_path = posts_dir.join(month_folder);
    let mut post_files = Vec::new();

    for entry in fs::read_dir(&month_path)? {
        let entry = entry?;
        if !entry.file_type()?.is_file() {
            continue;
        }

        let file_name = entry.file_name().to_string_lossy().to_string();
        if !file_name.ends_with(".md") || is_draft_file(&file_name) {
            continue;
        }

        post_files.push(PostFile {
            path: entry.path(),
            month_folder: month_folder.to_string(),
            file_name,
        });
    }

    Ok(post_files)
}

fn read_post_file(path: &Path, month_folder: &str, file_name: &str) -> CompileResult<Post> {
    let source = fs::read_to_string(path)?;
    let (frontmatter, content) = parse_markdown_file(path, &source)?;
    let id = extract_id_from_file_name(file_name);
    let compiled = compile_markdown(content);

    Ok(Post {
        id,
        content: content.to_string(),
        html: compiled.html,
        islands: compiled.islands,
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
        toc: compiled.toc,
        extra: frontmatter.extra,
    })
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
    use std::fs;

    use super::*;

    #[test]
    fn compiles_toc_with_markdown_compiler_rules() {
        let dir =
            std::env::temp_dir().join(format!("garden-content-compiler-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();
        let path = dir.join("math-heading.md");
        fs::write(
            &path,
            "---\ntitle: Math\ndate: 2026-01-01\n---\n## hi: $x^2 = y$\n\n## hi: $x^2 = y$\n",
        )
        .unwrap();

        let post = compile_post_file(&path, "202601").unwrap().unwrap();

        assert_eq!(post.toc.len(), 2);
        assert_eq!(post.toc[0].id, "hi-x-2-y");
        assert_eq!(post.toc[0].text, "hi: x^2 = y");
        assert_eq!(post.toc[1].id, "hi-x-2-y-1");
        assert!(post.html.contains("class=\"katex\""));
        assert!(post.content.contains("$x^2 = y$"));

        let _ = fs::remove_file(path);
        let _ = fs::remove_dir(dir);
    }
}
