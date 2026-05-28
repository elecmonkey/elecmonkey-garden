use crate::islands::MarkdownIsland;

#[derive(Debug, Clone)]
pub struct TocItem {
    pub id: String,
    pub text: String,
    pub level: u8,
}

#[derive(Debug, Clone)]
pub struct CompileMarkdownOutput {
    pub html: String,
    pub toc: Vec<TocItem>,
    pub islands: Vec<MarkdownIsland>,
}
