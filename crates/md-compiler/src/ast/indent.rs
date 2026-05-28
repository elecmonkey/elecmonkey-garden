use comrak::{
    nodes::{AstNode, NodeHtmlBlock, NodeLink, NodeValue},
    Arena,
};

use crate::html::{escape_attr, escape_html};

const INDENT_MARKER: &str = "[indent]";

pub fn rewrite_indent_paragraphs<'a>(arena: &'a Arena<'a>, nodes: &[&'a AstNode<'a>]) {
    for &node in nodes {
        if !matches!(node.data.borrow().value, NodeValue::Paragraph) {
            continue;
        }

        if strip_indent_marker(node) {
            replace_with_indented_html(arena, node);
        }
    }
}

fn strip_indent_marker(node: &AstNode<'_>) -> bool {
    let Some(first_child) = node.first_child() else {
        return false;
    };

    let mut data = first_child.data.borrow_mut();
    match &mut data.value {
        NodeValue::Text(text) if text.starts_with(INDENT_MARKER) => {
            *text = text[INDENT_MARKER.len()..].trim_start().to_string().into();
            true
        }
        _ => false,
    }
}

fn replace_with_indented_html<'a>(arena: &'a Arena<'a>, node: &'a AstNode<'a>) {
    let mut rendered_children = String::new();
    for child in node.children() {
        render_inline_fallback(child, &mut rendered_children);
    }

    let html = format!("<p data-indent=\"true\">{}</p>", rendered_children);
    let new_node = arena.alloc(AstNode::from(NodeValue::HtmlBlock(NodeHtmlBlock {
        block_type: 7,
        literal: html,
    })));
    node.insert_before(new_node);
    node.detach();
}

fn render_inline_fallback<'a>(node: &'a AstNode<'a>, out: &mut String) {
    let data = node.data.borrow();
    match &data.value {
        NodeValue::Text(text) => out.push_str(&escape_html(text)),
        NodeValue::Code(code) => {
            out.push_str("<code>");
            out.push_str(&escape_html(&code.literal));
            out.push_str("</code>");
        }
        NodeValue::Emph => render_inline_container(node, "em", out),
        NodeValue::Strong => render_inline_container(node, "strong", out),
        NodeValue::Strikethrough => render_inline_container(node, "del", out),
        NodeValue::SoftBreak => out.push('\n'),
        NodeValue::LineBreak => out.push_str("<br />\n"),
        NodeValue::Link(link) => {
            let NodeLink { url, title } = link.as_ref();
            out.push_str(&format!("<a href=\"{}\"", escape_attr(url)));
            if !title.is_empty() {
                out.push_str(&format!(" title=\"{}\"", escape_attr(title)));
            }
            out.push('>');
            drop(data);
            for child in node.children() {
                render_inline_fallback(child, out);
            }
            out.push_str("</a>");
        }
        NodeValue::Math(math) => {
            let style = if math.display_math {
                "display"
            } else {
                "inline"
            };
            let tag = if math.dollar_math { "span" } else { "code" };
            out.push_str(&format!("<{} data-math-style=\"{}\">", tag, style));
            out.push_str(&escape_html(&math.literal));
            out.push_str(&format!("</{}>", tag));
        }
        _ => {
            drop(data);
            for child in node.children() {
                render_inline_fallback(child, out);
            }
        }
    }
}

fn render_inline_container<'a>(node: &'a AstNode<'a>, tag: &str, out: &mut String) {
    out.push_str(&format!("<{}>", tag));
    for child in node.children() {
        render_inline_fallback(child, out);
    }
    out.push_str(&format!("</{}>", tag));
}
