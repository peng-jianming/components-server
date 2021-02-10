module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'prettier/standard',
  ],
  rules: {
    'no-new': 'off',
    'prefer-const': 'off'
  }
};
