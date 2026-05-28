use super::*;

#[test]
fn slugify_basic_english() {
    assert_eq!(slugify("Hello World"), "hello-world");
    assert_eq!(slugify("  Hello   World  "), "hello-world");
}

#[test]
fn slugify_strips_punctuation() {
    assert_eq!(slugify("API: Design!"), "api-design");
    assert_eq!(slugify("foo / bar"), "foo-bar");
}

#[test]
fn slugify_keeps_chinese() {
    assert_eq!(slugify("中文 标题"), "中文-标题");
    assert_eq!(slugify("标题 with code"), "标题-with-code");
}

#[test]
fn slugify_handles_empty_and_punct_only() {
    assert_eq!(slugify(""), "");
    assert_eq!(slugify("???"), "");
}

#[test]
fn registry_disambiguates_duplicates() {
    let mut r = SlugRegistry::new();
    assert_eq!(r.make_id("Title"), "title");
    assert_eq!(r.make_id("Title"), "title-1");
    assert_eq!(r.make_id("Title"), "title-2");
    assert_eq!(r.make_id("Other"), "other");
    assert_eq!(r.make_id("Other"), "other-1");
}

#[test]
fn registry_falls_back_for_empty_slug() {
    let mut r = SlugRegistry::new();
    assert_eq!(r.make_id("???"), "section");
    assert_eq!(r.make_id("***"), "section-1");
}
