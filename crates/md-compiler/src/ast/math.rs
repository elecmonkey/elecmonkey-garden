use comrak::nodes::{AstNode, NodeValue};

use crate::math::render_math;

pub fn render_math_nodes<'a>(nodes: &[&'a AstNode<'a>]) {
    for &node in nodes {
        let replacement = {
            let data = node.data.borrow();
            let NodeValue::Math(math) = &data.value else {
                continue;
            };

            render_math(&math.literal, math.display_math)
        };

        node.data.borrow_mut().value = NodeValue::HtmlInline(replacement);
    }
}
