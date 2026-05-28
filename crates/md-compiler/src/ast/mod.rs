mod code_fence;
mod heading;
mod indent;
mod math;
mod sanitize;

use comrak::{nodes::AstNode, Arena};

use crate::TocItem;

#[derive(Debug, Clone)]
pub struct AstPreprocessResult {
    pub toc: Vec<TocItem>,
}

pub fn preprocess<'a>(arena: &'a Arena<'a>, root: &'a AstNode<'a>) -> AstPreprocessResult {
    // Collect descendants first so mutating/inserting nodes cannot disturb the
    // iterator's traversal state.
    let nodes: Vec<&'a AstNode<'a>> = root.descendants().collect();

    sanitize::neutralize_raw_html(&nodes);
    math::render_math_nodes(&nodes);
    code_fence::normalize_plain_code_blocks(&nodes);
    let toc = heading::inject_anchors_and_collect_toc(arena, &nodes);
    indent::rewrite_indent_paragraphs(arena, &nodes);

    AstPreprocessResult { toc }
}
