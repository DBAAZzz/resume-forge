import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(currentDir, '../src/template/resume-template.md');
const outputDir = path.resolve(currentDir, '../dist/template');
const targetPath = path.resolve(outputDir, 'resume-template.md');

await mkdir(outputDir, { recursive: true });
await cp(sourcePath, targetPath, { force: true });

console.log(`Copied template to ${targetPath}`);
