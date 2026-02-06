import globals from 'globals';

import { createBaseConfig } from './base.mjs';

export function createServerConfig({
  files = ['**/*.{ts,tsx,js}'],
  ignores = ['**/dist', '**/node_modules', '**/.env', '**/eslint.config.js'],
  tsconfigRootDir,
  tsconfigProject = './tsconfig.json',
  parserOptions = {},
  settings = {},
  extraExtends = [],
  extraPlugins = {},
  rules = {},
} = {}) {
  const importResolver = settings['import/resolver'] ?? {};

  return createBaseConfig({
    files,
    ignores,
    runtimeGlobals: globals.node,
    parserOptions: {
      project: tsconfigProject,
      ...(tsconfigRootDir ? { tsconfigRootDir } : {}),
      ...parserOptions,
    },
    settings: {
      ...settings,
      'import/resolver': {
        node: true,
        ...importResolver,
        typescript: {
          project: tsconfigProject,
          extensionAlias: {
            '.js': ['.ts', '.tsx', '.d.ts', '.js'],
          },
          ...(importResolver.typescript ?? {}),
        },
      },
    },
    extraExtends,
    extraPlugins,
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      ...rules,
    },
  });
}
