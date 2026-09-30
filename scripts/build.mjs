// Build pipeline: type-check and compile TypeScript, then copy static assets.
// Kept dependency-free on purpose; see docs/adr/0001-zero-runtime-dependencies.md.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tsc = require.resolve('typescript/bin/tsc');

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

execFileSync(process.execPath, [tsc, '-p', 'tsconfig.build.json'], { stdio: 'inherit' });
cpSync('public', 'dist', { recursive: true });

console.log('Build complete: dist/');
