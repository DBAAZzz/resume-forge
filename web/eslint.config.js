import { createWebConfig } from '@resume/eslint-config/web';
import tailwindcss from 'eslint-plugin-tailwindcss';

export default createWebConfig({
  tsconfigRootDir: import.meta.dirname,
  extraPlugins: {
    tailwindcss,
  },
  settings: {
    tailwindcss: {
      callees: ['cn', 'clsx', 'cva', 'twMerge'],
      config: 'tailwind.config.js',
    },
  },
  rules: {
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-contradicting-classname': 'error',
    // Allow project-level semantic class names from component libraries.
    'tailwindcss/no-custom-classname': 'off',
  },
});
