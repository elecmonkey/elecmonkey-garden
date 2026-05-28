use std::collections::HashMap;

use super::slugify;

/// Generates unique heading ids while keeping first appearance unsuffixed.
#[derive(Debug, Default)]
pub struct SlugRegistry {
    seen: HashMap<String, u32>,
}

impl SlugRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    /// Generate a unique id for a heading text.
    ///
    /// Empty slugs fall back to `section`, then `section-1`, `section-2`, ...
    pub fn make_id(&mut self, text: &str) -> String {
        let base = match slugify(text) {
            slug if slug.is_empty() => "section".to_string(),
            slug => slug,
        };

        let count = self.seen.entry(base.clone()).or_insert(0);
        let id = if *count == 0 {
            base.clone()
        } else {
            format!("{}-{}", base, *count)
        };
        *count += 1;
        id
    }
}
