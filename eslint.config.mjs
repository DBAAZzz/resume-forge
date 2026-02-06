import path from 'node:path';

import { defineConfig } from 'eslint/config';

import { createServerConfig, createWebConfig } from '@resume/eslint-config';

const rootDir = import.meta.dirname;

export default defineConfig([
  ...createWebConfig({
    files: ['web/**/*.{ts,tsx}'],
    tsconfigRootDir: path.join(rootDir, 'web'),
  }),
  ...createServerConfig({
    files: ['server/**/*.{ts,tsx,js}'],
    tsconfigRootDir: path.join(rootDir, 'server'),
  }),
]);
