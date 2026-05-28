use std::collections::BTreeMap;
use std::path::PathBuf;

pub use garden_md_compiler::{MarkdownIsland, TocItem};

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
    pub html: String,
    pub islands: Vec<MarkdownIsland>,
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
pub enum FrontmatterValue {
    String(String),
    Bool(bool),
    Array(Vec<String>),
}
