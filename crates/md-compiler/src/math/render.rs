use katex_rs::{render_to_string, KatexContext, Settings};

use crate::html::escape_html;

/// Render a LaTeX math fragment to KaTeX-compatible HTML.
///
/// Invalid expressions are rendered as KaTeX error markup instead of failing the
/// whole Markdown compilation. This matches the private-site use case better
/// than treating one bad formula as a build-stopping compiler error.
pub fn render_math(latex: &str, display_mode: bool) -> String {
    let ctx = KatexContext::default();
    let mut settings = Settings::default();
    settings.display_mode = display_mode;
    settings.throw_on_error = false;

    render_to_string(&ctx, latex, &settings)
        .unwrap_or_else(|error| render_error_fallback(latex, error))
}

fn render_error_fallback(latex: &str, error: katex_rs::ParseError) -> String {
    format!(
        "<span class=\"katex-error\" title=\"{}\" style=\"color: #cc0000\">{}</span>",
        escape_html(&error.to_string()),
        escape_html(latex)
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn renders_inline_katex_markup() {
        let html = render_math("x^2", false);

        assert!(html.contains("class=\"katex\""));
        assert!(html.contains("class=\"katex-mathml\""));
        assert!(html.contains("class=\"katex-html\""));
        assert!(!html.contains("katex-display"));
    }

    #[test]
    fn renders_display_katex_markup() {
        let html = render_math("x^2", true);

        assert!(html.contains("class=\"katex-display\""));
        assert!(html.contains("class=\"katex\""));
    }

    #[test]
    fn invalid_math_becomes_error_markup() {
        let html = render_math(r"\frac{a}{", false);

        assert!(html.contains("katex-error"));
        assert!(html.contains(r"\frac{a}{"));
    }
}
