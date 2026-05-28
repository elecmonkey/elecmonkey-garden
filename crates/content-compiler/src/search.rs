pub(crate) fn normalize_search_content(content: &str) -> String {
    let without_fenced_code = replace_fenced_code_blocks(content);
    let without_inline_code = unwrap_inline_code(&without_fenced_code);
    let without_html_tags = replace_html_tags(&without_inline_code);
    collapse_search_whitespace(&without_html_tags)
}

fn replace_fenced_code_blocks(content: &str) -> String {
    let mut result = String::new();
    let chars = content.chars().collect::<Vec<_>>();
    let mut index = 0;

    while index < chars.len() {
        if has_backtick_fence_at(&chars, index) {
            if let Some(end_index) = find_closing_backtick_fence(&chars, index + 3) {
                result.push(' ');
                index = end_index + 3;
                continue;
            }
        }

        result.push(chars[index]);
        index += 1;
    }

    result
}

fn unwrap_inline_code(content: &str) -> String {
    let mut result = String::new();
    let chars = content.chars().collect::<Vec<_>>();
    let mut index = 0;

    while index < chars.len() {
        if chars[index] == '`' {
            if let Some(end_index) = find_closing_inline_backtick(&chars, index + 1) {
                result.extend(chars[index + 1..end_index].iter());
                index = end_index + 1;
                continue;
            }
        }

        result.push(chars[index]);
        index += 1;
    }

    result
}

fn replace_html_tags(content: &str) -> String {
    let mut result = String::new();
    let chars = content.chars().collect::<Vec<_>>();
    let mut index = 0;

    while index < chars.len() {
        if chars[index] == '<' {
            if let Some(end_index) = find_html_tag_end(&chars, index + 1) {
                result.push(' ');
                index = end_index + 1;
                continue;
            }
        }

        result.push(chars[index]);
        index += 1;
    }

    result
}

fn collapse_search_whitespace(content: &str) -> String {
    let mut result = String::new();
    let mut pending_space = false;

    for ch in content.chars() {
        push_search_char(&mut result, ch, &mut pending_space);
    }

    result
}

fn has_backtick_fence_at(chars: &[char], index: usize) -> bool {
    matches!(chars.get(index..index + 3), Some(['`', '`', '`']))
}

fn find_closing_backtick_fence(chars: &[char], start: usize) -> Option<usize> {
    (start..chars.len()).find(|&index| has_backtick_fence_at(chars, index))
}

fn find_closing_inline_backtick(chars: &[char], start: usize) -> Option<usize> {
    if chars.get(start) == Some(&'`') {
        return None;
    }
    (start..chars.len()).find(|&index| chars[index] == '`')
}

fn find_html_tag_end(chars: &[char], start: usize) -> Option<usize> {
    (start..chars.len()).find(|&index| chars[index] == '>')
}

fn push_search_char(result: &mut String, ch: char, pending_space: &mut bool) {
    if ch.is_whitespace() || is_search_separator(ch) {
        *pending_space = true;
        return;
    }

    if *pending_space && !result.is_empty() {
        result.push(' ');
    }
    *pending_space = false;
    result.push(ch);
}

fn is_search_separator(ch: char) -> bool {
    matches!(
        ch,
        '[' | ']' | '(' | ')' | '*' | '_' | '>' | '#' | '~' | '-'
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_search_content_like_previous_js_pipeline() {
        let content = "## Hello World\n\n```ts\nconst a = 1;\n```\nUse `React` and [Link](https://example.com).\n<div>HTML</div>\npull-request-target";
        assert_eq!(
            normalize_search_content(content),
            "Hello World Use React and Link https://example.com . HTML pull request target",
        );
    }

    #[test]
    fn replaces_inline_fenced_code_with_space_for_search() {
        assert_eq!(normalize_search_content("a```code```b"), "a b");
    }

    #[test]
    fn preserves_unmatched_backticks_like_previous_js_pipeline() {
        assert_eq!(
            normalize_search_content("call run` method"),
            "call run` method"
        );
    }

    #[test]
    fn removes_html_like_inline_code_after_unwrapping_for_search() {
        assert_eq!(
            normalize_search_content("`Option<extern \"C\" fn(...)>`，支持空指针情况。"),
            "Option ，支持空指针情况。"
        );
        assert_eq!(
            normalize_search_content("它暂不支持 `<Transition>`、`<KeepAlive>` 与 SSR"),
            "它暂不支持 、 与 SSR"
        );
        assert_eq!(
            normalize_search_content("包括 `<!--ssr-outlet-->` 占位符"),
            "包括 占位符"
        );
        assert_eq!(
            normalize_search_content("HTML 中 `<a>` 标签的行为有关。"),
            "HTML 中 标签的行为有关。"
        );
    }

    #[test]
    fn preserves_unclosed_html_like_previous_js_pipeline() {
        assert_eq!(
            normalize_search_content("keep <unclosed text"),
            "keep <unclosed text"
        );
    }
}
