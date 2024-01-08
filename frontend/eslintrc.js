module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    "next/core-web-vitals",
    'plugin:@typescript-eslint/recommended',
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended", // リアクト用設定を適用
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'next.config.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off', // インターフェースの接頭辞はチェックしない
    '@typescript-eslint/explicit-function-return-type': 'off', // 返り値の型指定はチェックしない
    '@typescript-eslint/explicit-module-boundary-types': 'off', // エクスポートされる関数の型指定はチェックしない
    '@typescript-eslint/no-explicit-any': 'on', // 明示的なany型を許可しない
    '@typescript-eslint/no-non-null-assertion': 'on', // 非nullアサーションを許可しない
    "indent": ["error", 2, { "SwitchCase": 1 }], // インデントは2スペース
    "semi": ["error", "always"], // セミコロンは必須
    "quotes": ["error", "single"], // シングルクォートのみ許可
    "react/react-in-jsx-scope": "off"
  },
};

