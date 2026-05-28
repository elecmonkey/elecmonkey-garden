//! Garden Markdown compiler.

mod ast;
mod html;
mod islands;
mod math;
mod options;
mod slug;
mod types;

pub use islands::MarkdownIsland;
pub use types::{CompileMarkdownOutput, TocItem};

/// Compile a Markdown source into HTML, TOC and islands.
pub fn compile_markdown(input: &str) -> CompileMarkdownOutput {
    use comrak::{format_html_with_plugins, options::Plugins, parse_document, Arena};

    let arena = Arena::new();
    let comrak_options = options::build_comrak_options();
    let root = parse_document(&arena, input, &comrak_options);

    let ast::AstPreprocessResult { toc } = ast::preprocess(&arena, root);

    let code_fence_adapter = islands::MarkdownCodeFenceAdapter::default();
    let mut plugins = Plugins::default();
    for language in islands::collect_code_fence_languages(root) {
        plugins
            .render
            .codefence_renderers
            .insert(language, &code_fence_adapter);
    }
    plugins.render.codefence_syntax_highlighter = Some(&code_fence_adapter);

    let mut html = String::new();
    format_html_with_plugins(root, &comrak_options, &mut html, &plugins)
        .expect("format_html_with_plugins should not fail when writing into String");

    CompileMarkdownOutput {
        html,
        toc,
        islands: code_fence_adapter.islands(),
    }
}

#[cfg(test)]
mod tests;
