use comrak::nodes::{AstNode, NodeValue};

use crate::islands::{first_info_token, PLAIN_CODE_LANGUAGE};

/// Give no-language code blocks a private language token.
///
/// Comrak's `CodefenceRendererAdapter` intentionally does not run for an empty
/// info string. Normalizing the AST lets all code blocks go through the same
/// island renderer without leaking this private token into the public metadata
/// or generated HTML.
pub fn normalize_plain_code_blocks<'a>(nodes: &[&'a AstNode<'a>]) {
    for &node in nodes {
        let mut data = node.data.borrow_mut();
        let NodeValue::CodeBlock(code_block) = &mut data.value else {
            continue;
        };

        if first_info_token(&code_block.info).is_empty() {
            code_block.info = PLAIN_CODE_LANGUAGE.to_string();
        }
    }
}
