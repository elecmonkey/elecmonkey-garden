use comrak::nodes::{AstNode, NodeValue};

/// Build the raw slug for a heading text without considering duplicates.
pub fn slugify(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut last_dash = true;

    for ch in text.chars() {
        if is_slug_keep(ch) {
            for lower in ch.to_lowercase() {
                out.push(lower);
            }
            last_dash = false;
        } else if !last_dash {
            out.push('-');
            last_dash = true;
        }
    }

    if out.ends_with('-') {
        out.pop();
    }
    out
}

fn is_slug_keep(ch: char) -> bool {
    if ch.is_ascii_alphanumeric() || ch == '_' {
        return true;
    }
    if ch.is_ascii() {
        return false;
    }
    ch.is_alphabetic() || ch.is_numeric()
}

/// Walk a heading's inline children and produce its plain-text content.
pub fn extract_heading_text<'a>(node: &'a AstNode<'a>) -> String {
    let mut out = String::new();
    collect_text(node, &mut out);
    out
}

fn collect_text<'a>(node: &'a AstNode<'a>, out: &mut String) {
    let data = node.data.borrow();
    match &data.value {
        NodeValue::Text(text) => out.push_str(text),
        NodeValue::Code(code) => out.push_str(&code.literal),
        NodeValue::Math(math) => out.push_str(&math.literal),
        NodeValue::SoftBreak | NodeValue::LineBreak => out.push(' '),
        NodeValue::HtmlInline(_) | NodeValue::FootnoteReference(_) => {}
        _ => {
            drop(data);
            for child in node.children() {
                collect_text(child, out);
            }
        }
    }
}
