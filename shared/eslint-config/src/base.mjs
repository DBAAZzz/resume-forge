import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

const defaultImportOrderOptions = {
  groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
  pathGroups: [
    {
      pattern: '@/**',
      group: 'internal',
    },
  ],
  pathGroupsExcludedImportTypes: ['builtin'],
  'newlines-between': 'always',
  alphabetize: {
    order: 'asc',
    caseInsensitive: true,
  },
};

function withImportSettingsDefaults(settings) {
  const importResolver = settings['import/resolver'] ?? {};

  return {
    ...settings,
    'import/resolver': {
      ...importResolver,
      typescript: {
        alwaysTryTypes: true,
        ...(importResolver.typescript ?? {}),
      },
    },
    'import/internal-regex': settings['import/internal-regex'] ?? '^@/',
  };
}

export function createBaseConfig({
  files = ['**/*.{ts,tsx,js}'],
  ignores = ['**/dist', '**/node_modules'],
  ecmaVersion = 2022,
  runtimeGlobals,
  parserOptions = {},
  settings = {},
  extraExtends = [],
  extraPlugins = {},
  rules = {},
} = {}) {
  return tseslint.config(
    {
      ignores,
    },
    {
      files,
      extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended,
        eslintConfigPrettier,
        ...extraExtends,
      ],
      languageOptions: {
        ecmaVersion,
        globals: runtimeGlobals,
        parserOptions,
      },
      plugins: {
        import: importPlugin,
        ...extraPlugins,
      },
      settings: withImportSettingsDefaults(settings),
      rules: {
        ...importPlugin.configs.recommended.rules,
        ...importPlugin.configs.typescript.rules,
        'import/order': ['error', defaultImportOrderOptions],
        ...rules,
      },
    }
  );
}
