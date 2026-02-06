import { createServerConfig } from '@resume/eslint-config/server';

export default createServerConfig({
  tsconfigRootDir: import.meta.dirname,
});
