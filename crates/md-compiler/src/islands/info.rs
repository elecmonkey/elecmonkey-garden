use comrak::nodes::{AstNode, NodeValue};
use std::collections::BTreeSet;

pub const PLAIN_CODE_LANGUAGE: &str = "garden_plain_code";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CodeFenceInfo {
    pub raw_language: String,
    pub language: Option<String>,
    pub range: Option<String>,
}

impl CodeFenceInfo {
    pub fn parse(raw_language: &str) -> Self {
        let raw_language = raw_language.trim().to_string();
        if raw_language.is_empty() || raw_language == PLAIN_CODE_LANGUAGE {
            return Self {
                raw_language,
                language: None,
                range: None,
            };
        }

        let bytes = raw_language.as_bytes();
        if let Some(open) = bytes.iter().position(|&b| b == b'{') {
            if let Some(close_offset) = bytes[open + 1..].iter().position(|&b| b == b'}') {
                let close = open + 1 + close_offset;
                return Self {
                    language: non_empty(raw_language[..open].trim()),
                    range: non_empty(raw_language[open + 1..close].trim()),
                    raw_language,
                };
            }
        }

        Self {
            language: non_empty(&raw_language),
            range: None,
            raw_language,
        }
    }
}

pub fn first_info_token(info: &str) -> &str {
    info.trim().split_whitespace().next().unwrap_or("")
}

pub fn collect_languages<'a>(root: &'a AstNode<'a>) -> Vec<String> {
    let mut languages = BTreeSet::new();
    for node in root.descendants() {
        let data = node.data.borrow();
        let NodeValue::CodeBlock(code_block) = &data.value else {
            continue;
        };
        let language = first_info_token(&code_block.info);
        if !language.is_empty() && language != "math" {
            languages.insert(language.to_string());
        }
    }
    languages.into_iter().collect()
}

fn non_empty(value: &str) -> Option<String> {
    if value.is_empty() {
        None
    } else {
        Some(value.to_string())
    }
}
