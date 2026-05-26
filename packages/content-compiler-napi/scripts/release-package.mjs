#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, '..');
const artifactsDir = path.join(packageDir, 'artifacts/npm');
const packageJsonPath = path.join(packageDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name;
const packageVersion = packageJson.version;
const binaryName = packageJson.napi?.binaryName || 'garden-content-compiler';
const npmDir = path.join(packageDir, 'npm');

const releaseTargets = [
  'aarch64-apple-darwin',
  'x86_64-unknown-linux-gnu',
  'x86_64-unknown-linux-musl',
];

const targetMeta = {
  'aarch64-apple-darwin': {
    platformArchABI: 'darwin-arm64',
    packageName: `${packageName}-darwin-arm64`,
    nativeFile: `${binaryName}.darwin-arm64.node`,
    rustup: true,
  },
  'x86_64-unknown-linux-gnu': {
    platformArchABI: 'linux-x64-gnu',
    packageName: `${packageName}-linux-x64-gnu`,
    nativeFile: `${binaryName}.linux-x64-gnu.node`,
    rustup: true,
  },
  'x86_64-unknown-linux-musl': {
    platformArchABI: 'linux-x64-musl',
    packageName: `${packageName}-linux-x64-musl`,
    nativeFile: `${binaryName}.linux-x64-musl.node`,
    rustup: true,
  },
};

function parseArgs(argv) {
  const options = {
    dryRun: false,
    publish: false,
    otp: undefined,
    printOnly: false,
    skipBuild: false,
    skipPack: false,
    targets: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--print-only') {
      options.printOnly = true;
    } else if (arg === '--publish') {
      options.publish = true;
    } else if (arg === '--otp') {
      const otp = argv[i + 1];
      if (!otp) throw new Error('--otp requires a value');
      options.otp = otp;
      i += 1;
    } else if (arg === '--skip-build') {
      options.skipBuild = true;
    } else if (arg === '--skip-pack') {
      options.skipPack = true;
    } else if (arg === '--target') {
      const target = argv[i + 1];
      if (!target) throw new Error('--target requires a Rust target triple');
      options.targets.push(target);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.targets = options.targets.length
    ? unique(options.targets)
    : detectTargetsForHost();

  for (const target of options.targets) {
    if (!releaseTargets.includes(target)) {
      throw new Error(`Unsupported release target: ${target}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Build and optionally publish ${packageName}@${packageVersion}.

Usage:
  node scripts/release-package.mjs [options]

Options:
  --target <triple>  Build/publish a specific release target. Can be repeated.
                     Defaults to targets supported by the current host.
  --skip-build       Reuse existing native artifacts.
  --skip-pack        Do not run npm pack for verification tarballs.
  --dry-run          Run the full flow, then pass --dry-run to npm publish.
  --publish          Publish platform packages first, then the main package.
  --otp <code>       Forward npm one-time password to publish commands.
  --print-only       Print commands without executing them.
  -h, --help         Show this help.

Host defaults:
  macOS arm64: darwin-arm64 + linux-x64-gnu + linux-x64-musl via zig/cargo-zigbuild.
  Linux x64:   linux-x64-gnu natively + linux-x64-musl via zig/cargo-zigbuild.

Examples:
  node scripts/release-package.mjs --dry-run
  node scripts/release-package.mjs --publish
  node scripts/release-package.mjs --publish --otp 123456
  node scripts/release-package.mjs --print-only
  node scripts/release-package.mjs --target x86_64-unknown-linux-gnu --publish
`);
}

function unique(values) {
  return Array.from(new Set(values));
}

function detectTargetsForHost() {
  if (process.platform === 'darwin' && process.arch === 'arm64') {
    return releaseTargets;
  }

  if (process.platform === 'linux' && process.arch === 'x64') {
    return ['x86_64-unknown-linux-gnu', 'x86_64-unknown-linux-musl'];
  }

  throw new Error(
    `Unsupported release host ${process.platform}/${process.arch}. `
      + 'Use --target explicitly if you know this host can build the target.',
  );
}

function run(command, args, options = {}) {
  const display = [command, ...args].join(' ');
  console.log(`$ ${display}`);
  if (options.dryRun) return { status: 0 };

  const result = spawnSync(command, args, {
    cwd: options.cwd || packageDir,
    stdio: 'inherit',
    env: { ...process.env, ...(options.env || {}) },
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${display}`);
  }

  return result;
}

function runPackageBin(name, args, options = {}) {
  const binName = process.platform === 'win32' ? `${name}.cmd` : name;
  const localBin = path.join(packageDir, 'node_modules', '.bin', binName);

  if (fs.existsSync(localBin)) {
    return run(localBin, args, options);
  }

  return run('pnpm', ['exec', name, ...args], options);
}

function commandExists(command) {
  const args = command === 'zig' ? ['version'] : ['--version'];
  const result = spawnSync(command, args, {
    cwd: packageDir,
    stdio: 'ignore',
    env: process.env,
  });
  return result.status === 0;
}

function ensureTool(command, hint) {
  if (!commandExists(command)) {
    throw new Error(`Missing required tool: ${command}. ${hint}`);
  }
}

function ensurePrerequisites(targets) {
  ensureTool('rustup', 'Install Rust from https://rustup.rs/.');
  ensureTool('cargo', 'Install Rust from https://rustup.rs/.');
  ensureTool('pnpm', 'Install pnpm or enable Corepack.');

  if (targets.some(shouldUseZigCrossCompile)) {
    ensureTool('zig', 'Install zig before cross-compiling Linux targets.');
  }
}

function ensureRustTargets(targets, dryRun) {
  const targetsToInstall = targets.filter((target) => targetMeta[target]?.rustup);
  if (targetsToInstall.length === 0) return;
  run('rustup', ['target', 'add', ...targetsToInstall], { cwd: packageDir, dryRun });
}

function shouldUseZigCrossCompile(target) {
  if (!target.includes('linux')) return false;

  if (process.platform !== 'linux') return true;
  if (process.arch !== 'x64') return true;

  return target.includes('musl');
}

function nativeBuildArgs(target) {
  const args = ['build', '--platform', '--no-js', '--dts', 'native.d.ts', '--release', '--target', target];
  if (shouldUseZigCrossCompile(target)) {
    args.push('--cross-compile');
  }
  return args;
}

function cleanReleaseOutputs(targets) {
  fs.rmSync(artifactsDir, { recursive: true, force: true });
  fs.mkdirSync(artifactsDir, { recursive: true });
  for (const target of targets) {
    fs.rmSync(path.join(npmDir, targetMeta[target].platformArchABI), { recursive: true, force: true });
  }
}

function buildTargets(targets, dryRun) {
  for (const target of targets) {
    runPackageBin('napi', nativeBuildArgs(target), { cwd: packageDir, dryRun });
  }
  runPackageBin('rslib', ['build'], { cwd: packageDir, dryRun });
}

function preparePlatformPackages(dryRun) {
  runPackageBin('napi', ['create-npm-dirs'], { cwd: packageDir, dryRun });
  runPackageBin('napi', ['artifacts', '--output-dir', '.'], { cwd: packageDir, dryRun });
  runPackageBin('napi', ['pre-publish', '--skip-optional-publish'], { cwd: packageDir, dryRun });
}

function assertArtifacts(targets, dryRun) {
  if (dryRun) return;

  const missing = [];
  for (const target of targets) {
    const { platformArchABI, nativeFile } = targetMeta[target];
    const rootNativeFile = path.join(packageDir, nativeFile);
    const packageNativeFile = path.join(npmDir, platformArchABI, nativeFile);
    const packageJsonFile = path.join(npmDir, platformArchABI, 'package.json');

    if (!fs.existsSync(rootNativeFile)) missing.push(rootNativeFile);
    if (!fs.existsSync(packageNativeFile)) missing.push(packageNativeFile);
    if (!fs.existsSync(packageJsonFile)) missing.push(packageJsonFile);
  }

  if (!fs.existsSync(path.join(packageDir, 'dist/index.js'))) {
    missing.push(path.join(packageDir, 'dist/index.js'));
  }

  if (missing.length > 0) {
    throw new Error(`Missing release artifacts:\n${missing.map((item) => `  - ${item}`).join('\n')}`);
  }
}

function packPackages(targets, dryRun) {
  fs.mkdirSync(artifactsDir, { recursive: true });

  for (const target of targets) {
    run('npm', ['pack', '--pack-destination', artifactsDir], {
      cwd: path.join(npmDir, targetMeta[target].platformArchABI),
      dryRun,
    });
  }

  run('npm', ['pack', '--pack-destination', artifactsDir], { cwd: packageDir, dryRun });
}

function publishPackages(targets, options) {
  const publishArgs = ['publish', '--access', 'public'];
  if (options.dryRun) publishArgs.push('--dry-run');
  if (options.otp) publishArgs.push('--otp', options.otp);

  for (const target of targets) {
    run('npm', publishArgs, {
      cwd: path.join(npmDir, targetMeta[target].platformArchABI),
    });
  }

  run('npm', publishArgs, { cwd: packageDir });
}

function printSummary(targets, options) {
  console.log('\nRelease package set:');
  for (const target of targets) {
    const meta = targetMeta[target];
    console.log(`  - ${meta.packageName}@${packageVersion} (${meta.platformArchABI})`);
  }
  console.log(`  - ${packageName}@${packageVersion} (main package)`);

  console.log(`\nArtifacts directory: ${path.relative(process.cwd(), artifactsDir)}`);

  if (options.printOnly) {
    console.log('\nPrint-only completed; no commands were executed.');
  } else if (options.dryRun) {
    console.log('\nPublish dry-run completed. Remove --dry-run and add --publish to publish for real.');
  } else if (!options.publish) {
    console.log('\nBuild/pack completed. To publish, run:');
    console.log('  node scripts/release-package.mjs --publish');
  } else {
    console.log('\nPublish completed.');
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const targets = options.targets;

  console.log(`Release host: ${process.platform}/${process.arch} (${os.platform()} ${os.arch()})`);
  console.log(`Release targets: ${targets.join(', ')}`);

  ensurePrerequisites(targets);
  ensureRustTargets(targets, options.printOnly);

  if (!options.skipBuild) {
    if (!options.printOnly) cleanReleaseOutputs(targets);
    buildTargets(targets, options.printOnly);
    preparePlatformPackages(options.printOnly);
  }

  assertArtifacts(targets, options.printOnly);

  if (!options.skipPack) {
    packPackages(targets, options.printOnly);
  }

  if (options.publish || options.dryRun) {
    publishPackages(targets, options);
  }

  printSummary(targets, options);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
