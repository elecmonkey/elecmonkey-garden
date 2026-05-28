use super::*;

#[test]
fn renders_simple_paragraph() {
    let output = compile_markdown("hello **world**");
    assert!(output.html.contains("<p>hello <strong>world</strong></p>"));
    assert!(output.toc.is_empty());
    assert!(output.islands.is_empty());
}

#[test]
fn heading_anchor_and_toc_share_slug() {
    let output = compile_markdown("## Use `foo` and **Bar**\n\n## Use foo and Bar");

    assert_eq!(output.toc.len(), 2);
    assert_eq!(output.toc[0].id, "use-foo-and-bar");
    assert_eq!(output.toc[0].text, "Use foo and Bar");
    assert_eq!(output.toc[0].level, 2);
    assert_eq!(output.toc[1].id, "use-foo-and-bar-1");
    assert!(output.html.contains(
        r##"<h2><a inert href="#use-foo-and-bar" aria-hidden="true" class="anchor" id="use-foo-and-bar"></a>Use <code>foo</code> and <strong>Bar</strong></h2>"##
    ));
}

#[test]
fn renders_code_and_mermaid_islands() {
    let output =
        compile_markdown("```ts{1-2}\nconst a = 1 < 2;\n```\n\n```mermaid\ngraph TD;\n```");

    assert_eq!(
        output.islands,
        vec![
            MarkdownIsland::Code {
                id: "code-1".to_string(),
                language: Some("ts".to_string()),
                range: Some("1-2".to_string()),
            },
            MarkdownIsland::Mermaid {
                id: "mermaid-1".to_string(),
            },
        ]
    );
    assert!(output.html.contains(
        r#"data-md-island="code" data-island-id="code-1" data-language="ts" data-range="1-2""#
    ));
    assert!(output.html.contains("const a = 1 &lt; 2;"));
    assert!(output
        .html
        .contains(r#"data-md-island="mermaid" data-island-id="mermaid-1""#));
}

#[test]
fn renders_no_language_code_as_island() {
    let output = compile_markdown("```\nplain < text\n```");

    assert_eq!(
        output.islands,
        vec![MarkdownIsland::Code {
            id: "code-1".to_string(),
            language: None,
            range: None,
        }]
    );
    assert!(output
        .html
        .contains(r#"data-md-island="code" data-island-id="code-1""#));
    assert!(output.html.contains("plain &lt; text"));
}

#[test]
fn renders_file_download_island() {
    let output = compile_markdown(
        "```file\nexample.pdf\npdf\nhttps://example.com/a.pdf\nA PDF file\n2MB\n```",
    );

    assert_eq!(
        output.islands,
        vec![MarkdownIsland::FileDownload {
            id: "file-1".to_string(),
            filename: Some("example.pdf".to_string()),
            file_type: Some("pdf".to_string()),
            url: Some("https://example.com/a.pdf".to_string()),
            size: Some("2MB".to_string()),
        }]
    );
    assert!(output
        .html
        .contains(r#"data-md-island="file-download" data-island-id="file-1""#));
    assert!(output.html.contains(r#"data-filename="example.pdf""#));
    assert!(output.html.contains("A PDF file"));
}

#[test]
fn marks_indent_paragraphs() {
    let output = compile_markdown("[indent] This is **indented** with `code`.");

    assert!(output.html.contains(
        r#"<p data-indent="true">This is <strong>indented</strong> with <code>code</code>.</p>"#
    ));
}

#[test]
fn renders_inline_math_with_katex() {
    let output = compile_markdown("Inline $x^2$.");

    assert!(output.html.contains(r#"<span class="katex">"#));
    assert!(output.html.contains(r#"<span class="katex-mathml">"#));
    assert!(output
        .html
        .contains(r#"<span class="katex-html" aria-hidden="true">"#));
    assert!(!output.html.contains("data-math-style"));
    assert!(output.islands.is_empty());
}

#[test]
fn renders_display_math_with_katex() {
    let output = compile_markdown("$$x^2$$");

    assert!(output.html.contains(r#"<span class="katex-display">"#));
    assert!(output.html.contains(r#"<span class="katex">"#));
    assert!(output.islands.is_empty());
}

#[test]
fn omits_user_authored_raw_html() {
    let output = compile_markdown("Before <script>alert(1)</script> after\n\n<div>raw</div>");

    assert!(!output.html.contains("<script>"));
    assert!(!output.html.contains("<div>raw</div>"));
    assert!(output.html.contains("<!-- raw HTML omitted -->"));
}
