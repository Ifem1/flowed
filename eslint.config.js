export default [
  { ignores: ['dist/**','node_modules/**','.pytest_cache/**','artifacts/**','tests/**'] },
  { files: ['**/*.js','**/*.mjs'], rules: {} },
  { files: ['**/*.ts'], rules: {} }
];
