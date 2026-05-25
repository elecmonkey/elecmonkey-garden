use napi_derive::napi;

#[napi]
pub fn version() -> String {
  garden_content_compiler::version().to_string()
}
