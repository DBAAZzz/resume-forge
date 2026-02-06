import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

import { createBaseConfig } from './base.mjs';

export function createWebConfig({
  files = ['**/*.{ts,tsx}'],
  ignores = ['**/dist', '**/node_modules'],
  tsconfigRootDir,
  tsconfigProjects = ['./tsconfig.app.json', './tsconfig.node.json'],
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
    runtimeGlobals: globals.browser,
    parserOptions: {
      projectService: true,
      noWarnOnMultipleProjects: true,
      ...(tsconfigRootDir ? { tsconfigRootDir } : {}),
      ...parserOptions,
    },
    settings: {
      ...settings,
      'import/resolver': {
        ...importResolver,
        typescript: {
          project: tsconfigProjects,
          ...(importResolver.typescript ?? {}),
        },
      },
    },
    extraExtends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite, ...extraExtends],
    extraPlugins,
    rules,
  });
}
