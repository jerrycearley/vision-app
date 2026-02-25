/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['../../.eslintrc.cjs'],
  rules: {
    // Keep DX smooth.
    'react/no-unescaped-entities': 'off',
  },
};
