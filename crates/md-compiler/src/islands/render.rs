use std::fmt;

use crate::html::{escape_attr, escape_html};

use super::{file_download::FileDownloadMeta, info::CodeFenceInfo};

pub fn write_code_island(
    output: &mut dyn fmt::Write,
    id: &str,
    info: &CodeFenceInfo,
    source: &str,
) -> fmt::Result {
    write!(
        output,
        "<div data-md-island=\"code\" data-island-id=\"{}\"",
        escape_attr(id)
    )?;
    if let Some(language) = &info.language {
        write!(output, " data-language=\"{}\"", escape_attr(language))?;
    }
    if let Some(range) = &info.range {
        write!(output, " data-range=\"{}\"", escape_attr(range))?;
    }
    output.write_char('>')?;
    output.write_str("<pre><code")?;
    if let Some(language) = &info.language {
        write!(output, " class=\"language-{}\"", escape_attr(language))?;
    }
    output.write_char('>')?;
    output.write_str(&escape_html(source))?;
    output.write_str("</code></pre><button type=\"button\" data-copy-button>复制</button></div>\n")
}

pub fn write_mermaid_island(output: &mut dyn fmt::Write, id: &str, source: &str) -> fmt::Result {
    write!(
        output,
        "<div data-md-island=\"mermaid\" data-island-id=\"{}\"><pre><code class=\"language-mermaid\">{}</code></pre></div>\n",
        escape_attr(id),
        escape_html(source)
    )
}

pub fn write_file_download_island(
    output: &mut dyn fmt::Write,
    id: &str,
    meta: &FileDownloadMeta,
) -> fmt::Result {
    write!(
        output,
        "<div data-md-island=\"file-download\" data-island-id=\"{}\"",
        escape_attr(id)
    )?;
    if let Some(filename) = &meta.filename {
        write!(output, " data-filename=\"{}\"", escape_attr(filename))?;
    }
    if let Some(file_type) = &meta.file_type {
        write!(output, " data-type=\"{}\"", escape_attr(file_type))?;
    }
    if let Some(url) = &meta.url {
        write!(output, " data-url=\"{}\"", escape_attr(url))?;
    }
    if let Some(size) = &meta.size {
        write!(output, " data-size=\"{}\"", escape_attr(size))?;
    }

    output.write_str("><div class=\"file-download-fallback\">")?;
    if let Some(filename) = &meta.filename {
        if let Some(url) = &meta.url {
            write!(
                output,
                "<a href=\"{}\" download>{}</a>",
                escape_attr(url),
                escape_html(filename)
            )?;
        } else {
            write!(output, "<span>{}</span>", escape_html(filename))?;
        }
    }
    if let Some(description) = &meta.description {
        write!(output, "<p>{}</p>", escape_html(description))?;
    }
    if let Some(size) = &meta.size {
        write!(output, "<small>{}</small>", escape_html(size))?;
    }
    output.write_str("</div></div>\n")
}
