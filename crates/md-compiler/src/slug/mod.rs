//! Heading slug generation.
//!
//! The slug rules follow `docs/markdown-static-html-islands-plan.md`:
//!
//! - The input is the heading's flattened plain text (inline code, emphasis,
//!   links etc. are reduced to their textual content).
//! - English letters are lowercased.
//! - CJK / other non-ASCII letter characters are preserved as-is.
//! - Runs of whitespace and unsupported punctuation collapse into a single
//!   `-`.
//! - Leading and trailing `-` are trimmed.
//! - Repeated slugs are disambiguated with `-1`, `-2`, ... suffixes.

mod registry;
mod text;

pub use registry::SlugRegistry;
pub use text::{extract_heading_text, slugify};

#[cfg(test)]
mod tests;
