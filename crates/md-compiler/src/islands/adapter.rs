use std::{borrow::Cow, collections::HashMap, fmt};

use comrak::{
    adapters::{CodefenceRendererAdapter, SyntaxHighlighterAdapter},
    nodes::{AstNode, Sourcepos},
};

use super::{
    file_download::FileDownloadMeta,
    info::{self, CodeFenceInfo},
    render::{write_code_island, write_file_download_island, write_graphviz_island, write_mermaid_island},
    state::{IslandState, MarkdownIsland},
};

#[derive(Debug, Default)]
pub struct MarkdownCodeFenceAdapter {
    state: IslandState,
}

impl MarkdownCodeFenceAdapter {
    pub fn islands(&self) -> Vec<MarkdownIsland> {
        self.state.snapshot()
    }
}

pub fn collect_code_fence_languages<'a>(root: &'a AstNode<'a>) -> Vec<String> {
    info::collect_languages(root)
}

impl CodefenceRendererAdapter for MarkdownCodeFenceAdapter {
    fn write(
        &self,
        output: &mut dyn fmt::Write,
        lang: &str,
        meta: &str,
        code: &str,
        _sourcepos: Option<Sourcepos>,
    ) -> fmt::Result {
        match lang {
            "mermaid" => {
                let id = self.state.add_mermaid();
                write_mermaid_island(output, &id, code)
            }
            "viz" | "graphviz" => {
                let scale = parse_graphviz_scale(meta);
                let id = self.state.add_graphviz(scale);
                write_graphviz_island(output, &id, scale, code)
            }
            "file" => {
                let meta = FileDownloadMeta::parse(code);
                let id = self.state.add_file_download(&meta);
                write_file_download_island(output, &id, &meta)
            }
            _ => {
                let info = CodeFenceInfo::parse(lang);
                let id = self.state.add_code(&info);
                write_code_island(output, &id, &info, code)
            }
        }
    }
}

fn parse_graphviz_scale(meta: &str) -> Option<f64> {
    let open = meta.find('{')?;
    let close = meta[open + 1..].find('}')? + open + 1;
    let value = meta[open + 1..close].trim().parse::<f64>().ok()?;

    if value.is_finite() && value > 0.0 {
        Some(value)
    } else {
        None
    }
}

impl SyntaxHighlighterAdapter for MarkdownCodeFenceAdapter {
    fn write_highlighted(
        &self,
        output: &mut dyn fmt::Write,
        lang: Option<&str>,
        code: &str,
    ) -> fmt::Result {
        debug_assert!(lang.is_none_or(|value| value.is_empty()));
        output.write_str(&crate::html::escape_html(code))
    }

    fn write_pre_tag(
        &self,
        output: &mut dyn fmt::Write,
        _attributes: HashMap<&'static str, Cow<'_, str>>,
    ) -> fmt::Result {
        output.write_str("<pre>")
    }

    fn write_code_tag(
        &self,
        output: &mut dyn fmt::Write,
        attributes: HashMap<&'static str, Cow<'_, str>>,
    ) -> fmt::Result {
        output.write_str("<code")?;
        for (name, value) in attributes {
            write!(
                output,
                " {}=\"{}\"",
                name,
                crate::html::escape_attr(value.as_ref())
            )?;
        }
        output.write_char('>')
    }
}
