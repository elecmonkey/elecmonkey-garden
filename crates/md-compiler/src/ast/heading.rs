use comrak::{
    nodes::{AstNode, NodeValue},
    Arena,
};

use crate::{
    html::escape_attr,
    slug::{extract_heading_text, SlugRegistry},
    TocItem,
};

pub fn inject_anchors_and_collect_toc<'a>(
    arena: &'a Arena<'a>,
    nodes: &[&'a AstNode<'a>],
) -> Vec<TocItem> {
    let mut toc = Vec::new();
    let mut slugs = SlugRegistry::new();

    for &node in nodes {
        let level = match node.data.borrow().value {
            NodeValue::Heading(ref heading) => heading.level,
            _ => continue,
        };

        let text = extract_heading_text(node).trim().to_string();
        let id = slugs.make_id(&text);

        if (2..=6).contains(&level) {
            toc.push(TocItem {
                id: id.clone(),
                text,
                level,
            });
        }

        let anchor = format!(
            "<a inert href=\"#{}\" aria-hidden=\"true\" class=\"anchor\" id=\"{}\"></a>",
            escape_attr(&id),
            escape_attr(&id)
        );
        let anchor_node = arena.alloc(AstNode::from(NodeValue::HtmlInline(anchor)));

        if let Some(first_child) = node.first_child() {
            first_child.insert_before(anchor_node);
        } else {
            node.append(anchor_node);
        }
    }

    toc
}
