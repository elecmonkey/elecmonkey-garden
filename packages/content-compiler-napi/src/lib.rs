use garden_content_compiler::{
    compile_content, compile_post_file, CompileOptions, ContentManifest, FrontmatterValue,
    MarkdownIsland, Post, TocItem,
};
use napi_derive::napi;
use std::path::PathBuf;

#[napi(object)]
pub struct JsContentManifest {
    pub posts: Vec<JsPost>,
    pub public_posts: Vec<JsPost>,
}

#[napi(object)]
pub struct JsPost {
    pub id: String,
    pub content: String,
    pub html: String,
    pub islands: Vec<JsMarkdownIsland>,
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
    pub toc: Vec<JsTocItem>,
    pub extra: Vec<JsFrontmatterEntry>,
}

#[napi(object)]
pub struct JsMarkdownIsland {
    pub kind: String,
    pub id: String,
    pub language: Option<String>,
    pub range: Option<String>,
    pub filename: Option<String>,
    pub file_type: Option<String>,
    pub url: Option<String>,
    pub size: Option<String>,
}

#[napi(object)]
pub struct JsFrontmatterEntry {
    pub key: String,
    pub value: String,
}

#[napi(object)]
pub struct JsTocItem {
    pub id: String,
    pub text: String,
    pub level: u8,
}

#[napi]
pub fn version() -> String {
    garden_content_compiler::version().to_string()
}

#[napi]
pub fn compile_posts(posts_dir: String) -> napi::Result<JsContentManifest> {
    compile_content(CompileOptions {
        posts_dir: PathBuf::from(posts_dir),
    })
    .map(Into::into)
    .map_err(|error| napi::Error::from_reason(error.to_string()))
}

#[napi]
pub fn compile_post(post_file: String, month_folder: String) -> napi::Result<Option<JsPost>> {
    compile_post_file(&PathBuf::from(post_file), &month_folder)
        .map(|post| post.map(Into::into))
        .map_err(|error| napi::Error::from_reason(error.to_string()))
}

impl From<ContentManifest> for JsContentManifest {
    fn from(manifest: ContentManifest) -> Self {
        Self {
            posts: manifest.posts.into_iter().map(Into::into).collect(),
            public_posts: manifest.public_posts.into_iter().map(Into::into).collect(),
        }
    }
}

impl From<Post> for JsPost {
    fn from(post: Post) -> Self {
        Self {
            id: post.id,
            content: post.content,
            html: post.html,
            islands: post.islands.into_iter().map(Into::into).collect(),
            search_content: post.search_content,
            month_folder: post.month_folder,
            is_draft: post.is_draft,
            is_hidden: post.is_hidden,
            title: post.title,
            date: post.date,
            description: post.description,
            tags: post.tags,
            author: post.author,
            no_toc: post.no_toc,
            toc: post.toc.into_iter().map(Into::into).collect(),
            extra: post
                .extra
                .into_iter()
                .map(|(key, value)| JsFrontmatterEntry {
                    key,
                    value: frontmatter_value_into_string(value),
                })
                .collect(),
        }
    }
}

impl From<MarkdownIsland> for JsMarkdownIsland {
    fn from(island: MarkdownIsland) -> Self {
        match island {
            MarkdownIsland::Code {
                id,
                language,
                range,
            } => Self {
                kind: "code".to_string(),
                id,
                language,
                range,
                filename: None,
                file_type: None,
                url: None,
                size: None,
            },
            MarkdownIsland::Mermaid { id } => Self {
                kind: "mermaid".to_string(),
                id,
                language: None,
                range: None,
                filename: None,
                file_type: None,
                url: None,
                size: None,
            },
            MarkdownIsland::FileDownload {
                id,
                filename,
                file_type,
                url,
                size,
            } => Self {
                kind: "file-download".to_string(),
                id,
                language: None,
                range: None,
                filename,
                file_type,
                url,
                size,
            },
        }
    }
}

impl From<TocItem> for JsTocItem {
    fn from(item: TocItem) -> Self {
        Self {
            id: item.id,
            text: item.text,
            level: item.level,
        }
    }
}

fn frontmatter_value_into_string(value: FrontmatterValue) -> String {
    match value {
        FrontmatterValue::String(value) => value,
        FrontmatterValue::Bool(value) => value.to_string(),
        FrontmatterValue::Array(values) => values.join(","),
    }
}
