//! Garden content compiler core.
//!
//! The compiler owns Markdown/frontmatter/content-index preprocessing. React
//! and Rsbuild still own routing, layout, hydration, and final page rendering.

mod frontmatter;
mod reader;
mod search;
mod types;

pub use reader::{compile_content, compile_post_file};
pub use types::{
    CompileError, CompileOptions, CompileResult, ContentManifest, FrontmatterValue, MarkdownIsland,
    Post, TocItem,
};

pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
