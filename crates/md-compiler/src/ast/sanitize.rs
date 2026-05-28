use comrak::nodes::{AstNode, NodeValue};

const RAW_HTML_OMITTED: &str = "<!-- raw HTML omitted -->";

pub fn neutralize_raw_html<'a>(nodes: &[&'a AstNode<'a>]) {
    for &node in nodes {
        match &mut node.data.borrow_mut().value {
            NodeValue::HtmlBlock(html) => html.literal = RAW_HTML_OMITTED.to_string(),
            NodeValue::HtmlInline(html) => *html = RAW_HTML_OMITTED.to_string(),
            _ => {}
        }
    }
}
