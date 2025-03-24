module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    // 允许在特定文件中使用 require() 风格的导入
    'import/no-commonjs': 'off',
  },
  overrides: [
    {
      files: ['*.config.js', '*.config.mjs', 'postcss.config.js'],
      rules: {
        'import/no-commonjs': 'off',
      },
    },
  ],
}; 