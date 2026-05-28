#[derive(Debug, Clone, Default)]
pub struct FileDownloadMeta {
    pub filename: Option<String>,
    pub file_type: Option<String>,
    pub url: Option<String>,
    pub description: Option<String>,
    pub size: Option<String>,
}

impl FileDownloadMeta {
    pub fn parse(source: &str) -> Self {
        let mut lines = source.lines().map(str::trim);
        Self {
            filename: lines.next().and_then(non_empty),
            file_type: lines.next().and_then(non_empty),
            url: lines.next().and_then(non_empty),
            description: lines.next().and_then(non_empty),
            size: lines.next().and_then(non_empty),
        }
    }
}

fn non_empty(value: &str) -> Option<String> {
    if value.is_empty() {
        None
    } else {
        Some(value.to_string())
    }
}
