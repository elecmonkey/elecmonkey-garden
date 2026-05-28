use std::sync::Mutex;

use super::file_download::FileDownloadMeta;
use super::info::CodeFenceInfo;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MarkdownIsland {
    Code {
        id: String,
        language: Option<String>,
        range: Option<String>,
    },
    Mermaid {
        id: String,
    },
    FileDownload {
        id: String,
        filename: Option<String>,
        file_type: Option<String>,
        url: Option<String>,
        size: Option<String>,
    },
}

#[derive(Debug, Default)]
pub struct IslandState {
    inner: Mutex<IslandStateInner>,
}

#[derive(Debug, Default)]
struct IslandStateInner {
    code_count: usize,
    mermaid_count: usize,
    file_count: usize,
    islands: Vec<MarkdownIsland>,
}

impl IslandState {
    pub fn snapshot(&self) -> Vec<MarkdownIsland> {
        self.inner
            .lock()
            .expect("island state lock poisoned")
            .islands
            .clone()
    }

    pub fn add_code(&self, info: &CodeFenceInfo) -> String {
        let mut inner = self.inner.lock().expect("island state lock poisoned");
        inner.code_count += 1;
        let id = format!("code-{}", inner.code_count);
        inner.islands.push(MarkdownIsland::Code {
            id: id.clone(),
            language: info.language.clone(),
            range: info.range.clone(),
        });
        id
    }

    pub fn add_mermaid(&self) -> String {
        let mut inner = self.inner.lock().expect("island state lock poisoned");
        inner.mermaid_count += 1;
        let id = format!("mermaid-{}", inner.mermaid_count);
        inner
            .islands
            .push(MarkdownIsland::Mermaid { id: id.clone() });
        id
    }

    pub fn add_file_download(&self, meta: &FileDownloadMeta) -> String {
        let mut inner = self.inner.lock().expect("island state lock poisoned");
        inner.file_count += 1;
        let id = format!("file-{}", inner.file_count);
        inner.islands.push(MarkdownIsland::FileDownload {
            id: id.clone(),
            filename: meta.filename.clone(),
            file_type: meta.file_type.clone(),
            url: meta.url.clone(),
            size: meta.size.clone(),
        });
        id
    }
}
