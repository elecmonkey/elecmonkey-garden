//! Garden content compiler core.
//!
//! This crate is intentionally small at the migration skeleton stage. The
//! public boundary will be consumed by the napi wrapper package.

pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
