const path = require('node:path');

const candidates = [
  './garden-content-compiler.node',
  './garden-content-compiler.darwin-arm64.node',
  './garden-content-compiler.darwin-x64.node',
  './garden-content-compiler.linux-x64-gnu.node',
  './garden-content-compiler.linux-x64-musl.node',
  './garden-content-compiler.linux-arm64-gnu.node',
  './garden-content-compiler.linux-arm64-musl.node',
  './garden-content-compiler.win32-x64-msvc.node',
  './garden-content-compiler.win32-arm64-msvc.node',
];

let binding;
let loadError;
for (const candidate of candidates) {
  try {
    binding = require(candidate);
    break;
  } catch (error) {
    loadError = error;
  }
}

if (!binding) {
  binding = {
    version() {
      return '0.0.0';
    },
    compilePosts() {
      const message = [
        'garden-content-compiler native binding is not built for this platform.',
        'Run `pnpm --filter @elecmonkey/garden-content-compiler build`.',
        `Last lookup: ${path.basename(candidates[candidates.length - 1])}`,
      ].join(' ');
      throw new Error(loadError ? `${message} ${loadError.message}` : message);
    },
  };
}

module.exports = binding;
