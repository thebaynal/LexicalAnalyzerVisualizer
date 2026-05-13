import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { analyzeWithFallback } from './fallbackLexer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const lexerSource = path.join(repoRoot, 'lexer', 'lexical_analyzer.l');
const cacheDir = path.join(backendRoot, '.cache');
const executableName = process.platform === 'win32' ? 'lexical-analyzer.exe' : 'lexical-analyzer';
const executablePath = path.join(cacheDir, executableName);

function commandExists(command) {
  return new Promise((resolve) => {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    const child = spawn(checker, [command], {
      stdio: 'ignore',
      shell: process.platform === 'win32'
    });
    child.on('exit', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32' && command === 'where' ? true : false
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      const error = new Error(`${command} exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`);
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

async function ensureScannerBinary() {
  await fs.promises.mkdir(cacheDir, { recursive: true });

  const flexAvailable = await commandExists('flex');
  const compilerAvailable = (await commandExists('gcc')) || (await commandExists('clang'));
  if (!flexAvailable || !compilerAvailable) {
    return null;
  }

  const sourceStat = await fs.promises.stat(lexerSource);
  try {
    const binaryStat = await fs.promises.stat(executablePath);
    if (binaryStat.mtimeMs >= sourceStat.mtimeMs) {
      return executablePath;
    }
  } catch {
    // Rebuild when the binary is missing.
  }

  const generatedSource = path.join(cacheDir, 'lex.yy.c');
  await runCommand('flex', ['-o', generatedSource, lexerSource], { cwd: cacheDir });

  const compiler = (await commandExists('gcc')) ? 'gcc' : 'clang';
  const compilerArgs = [generatedSource, '-o', executablePath];
  await runCommand(compiler, compilerArgs, { cwd: cacheDir });
  return executablePath;
}

function parseScannerOutput(stdout) {
  const tokens = [];
  const errors = [];

  for (const rawLine of stdout.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    try {
      const entry = JSON.parse(line);
      if (entry.kind === 'error') {
        errors.push(entry);
      } else if (entry.kind === 'token') {
        tokens.push(entry);
      }
    } catch {
      // Ignore noisy lines from toolchains if any appear.
    }
  }

  return { tokens, errors };
}

function buildStats(tokens, errors) {
  const counts = tokens.reduce((accumulator, token) => {
    accumulator[token.type] = (accumulator[token.type] || 0) + 1;
    return accumulator;
  }, {});

  return {
    totalTokens: tokens.length,
    keywords: counts.keyword || 0,
    identifiers: counts.identifier || 0,
    literals: (counts.integer || 0) + (counts.float || 0) + (counts.string || 0) + (counts.char || 0),
    operators: counts.operator || 0,
    comments: counts.comment || 0,
    errors: errors.length
  };
}

export async function analyzeSource(source) {
  const binaryPath = await ensureScannerBinary();

  if (!binaryPath) {
    const fallback = analyzeWithFallback(source);
    return {
      engine: 'fallback-js',
      ...fallback,
      stats: buildStats(fallback.tokens, fallback.errors)
    };
  }

  const child = spawn(binaryPath, [], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  const exitPromise = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || `Flex scanner exited with code ${code}`));
    });
  });

  child.stdin.write(source);
  child.stdin.end();
  await exitPromise;

  const parsed = parseScannerOutput(stdout);
  return {
    engine: 'flex',
    ...parsed,
    stats: buildStats(parsed.tokens, parsed.errors)
  };
}

export function getEngineStatus() {
  return {
    backend: 'express',
    lexer: 'flex',
    cacheDir,
    executablePath
  };
}
