#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(packageDir, '../..');
const artifactsDir = path.join(packageDir, 'artifacts/npm');

const releaseTargets = [
  'aarch64-apple-darwin',
  'x86_64-unknown-linux-gnu',
  'x86_64-unknown-linux-musl',
];

const linuxX64Targets = [
  'x86_64-unknown-linux-gnu',
  'x86_64-unknown-linux-musl',
];

function parseArgs(argv) {
  const options = {
    targets: [],
    pack: false,
    platformPackages: false,
    releaseTargets: false,
    linuxX64: false,
    release: true,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--target') {
      const target = argv[i + 1];
      if (!target) throw new Error('--target requires a Rust target triple');
      options.targets.push(target);
      i += 1;
    } else if (arg === '--release-targets') {
      options.releaseTargets = true;
    } else if (arg === '--linux-x64') {
      options.linuxX64 = true;
    } else if (arg === '--pack') {
      options.pack = true;
    } else if (arg === '--platform-packages') {
      options.platformPackages = true;
    } else if (arg === '--debug') {
      options.release = false;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.releaseTargets) options.targets.push(...releaseTargets);
  if (options.linuxX64) options.targets.push(...linuxX64Targets);
  options.targets = Array.from(new Set(options.targets));

  return options;
}

function printHelp() {
  console.log(`Build local npm artifacts for @elecmonkey/garden-content-compiler.

Usage:
  node scripts/build-package.mjs [options]

Options:
  --target <triple>  Build one native target. Can be repeated.
  --linux-x64        Build Linux x64 GNU and musl targets.
  --release-targets  Build macOS arm64 and Linux x64 GNU/musl release targets.
  --debug            Build native binding without --release.
  --pack             Run pnpm pack into artifacts/npm after building.
  --platform-packages
                    Prepare napi platform package folders before packing.
  --dry-run          Print commands without running them.
  -h, --help         Show this help.

Examples:
  pnpm --filter @elecmonkey/garden-content-compiler pack:release
  pnpm --filter @elecmonkey/garden-content-compiler pack:linux-x64
  pnpm --filter @elecmonkey/garden-content-compiler pack:win32-x64
  node scripts/build-package.mjs --release-targets --platform-packages --pack

Notes:
  --release-targets covers macOS arm64, Linux x64 GNU, and Linux x64 musl.
  Linux GNU cross-builds use @napi-rs/cross-toolchain via --use-napi-cross.
  Linux musl cross-builds use napi's --cross-compile path and may require the local Rust cross toolchain.
  Windows targets are passed through to napi/cargo; run them on Windows CI if local cross toolchains are unavailable.
  This script only creates local tarballs; it does not publish to npm.
  Use --platform-packages when preparing optional native packages for npm publishing.`);
}

function run(command, args, options = {}) {
  const display = [command, ...args].join(' ');
  console.log(`$ ${display}`);
  if (options.dryRun) return;

  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${display}`);
  }
}

function nativeBuildArgs(target, release) {
  const args = ['exec', 'napi', 'build', '--platform', '--no-js', '--dts', 'native.d.ts'];
  if (release) args.push('--release');
  if (target) {
    args.push('--target', target);
    if (shouldUseZigCrossCompile(target)) {
      args.push('--cross-compile');
    }
  }
  return args;
}

function shouldUseZigCrossCompile(target) {
  if (!target.includes('linux')) return false;

  const hostPlatform = process.platform;
  const hostArch = process.arch;

  if (hostPlatform !== 'linux') return true;
  if (hostArch !== 'x64') return true;

  // On Linux x64, build the GNU package natively. The musl package still needs
  // zig/cargo-zigbuild unless the host is already a musl environment with a
  // suitable native toolchain.
  return target.includes('musl');
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.targets.length === 0) {
    run('pnpm', nativeBuildArgs(undefined, options.release), { cwd: packageDir, dryRun: options.dryRun });
  } else {
    for (const target of options.targets) {
      run('pnpm', nativeBuildArgs(target, options.release), { cwd: packageDir, dryRun: options.dryRun });
    }
  }

  run('pnpm', ['exec', 'rslib', 'build'], { cwd: packageDir, dryRun: options.dryRun });

  if (options.platformPackages) {
    run('pnpm', ['exec', 'napi', 'create-npm-dirs'], { cwd: packageDir, dryRun: options.dryRun });
    run('pnpm', ['exec', 'napi', 'artifacts', '--output-dir', '.'], { cwd: packageDir, dryRun: options.dryRun });
    run('pnpm', ['exec', 'napi', 'pre-publish', '--skip-optional-publish'], { cwd: packageDir, dryRun: options.dryRun });
  }

  if (options.pack) {
    if (!options.dryRun) fs.mkdirSync(artifactsDir, { recursive: true });
    run('pnpm', ['pack', '--pack-destination', artifactsDir], { cwd: packageDir, dryRun: options.dryRun });
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
