use std::collections::BTreeMap;
use std::path::Path;

use crate::{CompileError, CompileResult, FrontmatterValue};

#[derive(Default)]
pub(crate) struct Frontmatter {
    values: BTreeMap<String, FrontmatterValue>,
    pub(crate) extra: BTreeMap<String, FrontmatterValue>,
}

impl Frontmatter {
    pub(crate) fn get_string(&self, key: &str) -> String {
        match self.values.get(key) {
            Some(FrontmatterValue::String(value)) => value.clone(),
            Some(FrontmatterValue::Bool(value)) => value.to_string(),
            Some(FrontmatterValue::Array(values)) => values.join(", "),
            None => String::new(),
        }
    }

    pub(crate) fn get_bool(&self, key: &str) -> Option<bool> {
        match self.values.get(key) {
            Some(FrontmatterValue::Bool(value)) => Some(*value),
            Some(FrontmatterValue::String(value)) => match value.as_str() {
                "true" => Some(true),
                "false" => Some(false),
                _ => None,
            },
            _ => None,
        }
    }

    pub(crate) fn get_array(&self, key: &str) -> Vec<String> {
        match self.values.get(key) {
            Some(FrontmatterValue::Array(values)) => values.clone(),
            Some(FrontmatterValue::String(value)) if !value.is_empty() => vec![value.clone()],
            _ => Vec::new(),
        }
    }
}

pub(crate) fn parse_markdown_file<'a>(
    path: &Path,
    source: &'a str,
) -> CompileResult<(Frontmatter, &'a str)> {
    let Some(rest) = source.strip_prefix("---") else {
        return Ok((Frontmatter::default(), source));
    };

    let rest = rest
        .strip_prefix("\r\n")
        .or_else(|| rest.strip_prefix('\n'))
        .unwrap_or(rest);
    let Some(end) = rest.find("\n---") else {
        return Err(CompileError::InvalidFrontmatter {
            path: path.to_path_buf(),
            message: "missing closing delimiter".to_string(),
        });
    };

    let raw = &rest[..end];
    let mut content = &rest[end + "\n---".len()..];
    content = content
        .strip_prefix("\r\n")
        .or_else(|| content.strip_prefix('\n'))
        .unwrap_or(content);
    let frontmatter = parse_frontmatter(path, raw)?;

    Ok((frontmatter, content))
}

fn parse_frontmatter(path: &Path, raw: &str) -> CompileResult<Frontmatter> {
    let mut frontmatter = Frontmatter::default();

    for (line_index, line) in raw.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        let Some((key, value)) = trimmed.split_once(':') else {
            return Err(CompileError::InvalidFrontmatter {
                path: path.to_path_buf(),
                message: format!("line {} is not a key/value pair", line_index + 1),
            });
        };

        let key = key.trim().to_string();
        let value = parse_frontmatter_value(value.trim());
        if !matches!(
            key.as_str(),
            "title" | "date" | "description" | "tags" | "author" | "no_toc"
        ) {
            frontmatter.extra.insert(key.clone(), value.clone());
        }
        frontmatter.values.insert(key, value);
    }

    Ok(frontmatter)
}

fn parse_frontmatter_value(value: &str) -> FrontmatterValue {
    if value == "true" {
        return FrontmatterValue::Bool(true);
    }
    if value == "false" {
        return FrontmatterValue::Bool(false);
    }

    if value.starts_with('[') && value.ends_with(']') {
        return FrontmatterValue::Array(parse_inline_array(&value[1..value.len() - 1]));
    }

    FrontmatterValue::String(unquote(value))
}

fn parse_inline_array(value: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut current = String::new();
    let mut quote: Option<char> = None;
    let mut escape = false;

    for ch in value.chars() {
        if escape {
            current.push(ch);
            escape = false;
            continue;
        }

        if ch == '\\' {
            escape = true;
            current.push(ch);
            continue;
        }

        if matches!(quote, Some(q) if q == ch) {
            quote = None;
            current.push(ch);
            continue;
        }

        if quote.is_none() && (ch == '\'' || ch == '"') {
            quote = Some(ch);
            current.push(ch);
            continue;
        }

        if quote.is_none() && ch == ',' {
            let item = unquote(current.trim());
            if !item.is_empty() {
                result.push(item);
            }
            current.clear();
            continue;
        }

        current.push(ch);
    }

    let item = unquote(current.trim());
    if !item.is_empty() {
        result.push(item);
    }

    result
}

fn unquote(value: &str) -> String {
    let trimmed = value.trim();
    if trimmed.len() >= 2 {
        let first = trimmed.as_bytes()[0] as char;
        let last = trimmed.as_bytes()[trimmed.len() - 1] as char;
        if (first == '"' && last == '"') || (first == '\'' && last == '\'') {
            return trimmed[1..trimmed.len() - 1]
                .replace("\\\"", "\"")
                .replace("\\'", "'");
        }
    }
    trimmed.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_inline_frontmatter_array() {
        let tags = parse_inline_array("\"React\", 'Web 安全', CI/CD");
        assert_eq!(tags, vec!["React", "Web 安全", "CI/CD"]);
    }
}
