pub fn build_comrak_options() -> comrak::Options<'static> {
    let mut options = comrak::Options::default();
    options.extension.table = true;
    options.extension.strikethrough = true;
    options.extension.tasklist = true;
    options.extension.autolink = true;
    options.extension.footnotes = true;
    options.extension.math_dollars = true;

    // We render generated HtmlInline/HtmlBlock nodes for anchors and `[indent]`
    // paragraphs. User-authored raw HTML is neutralized during AST preprocessing
    // before rendering, preserving the current safe-by-default behavior.
    options.render.r#unsafe = true;
    options
}
