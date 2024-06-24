module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'next/core-web-vitals', // next用ルール
    'plugin:@typescript-eslint/recommended', // 推奨ルール
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // 型情報のルール
    'plugin:react/recommended', // React用ルール
    'plugin:prettier/recommended', // Prettierとの競合を防ぐ
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
    indent: ['error', 2, { SwitchCase: 1 }], // インデントは2スペース
    semi: ['error', 'always'], // セミコロン必須
    quotes: ['error', 'single', { avoidEscape: true }], // シングルクォートのみ許可
    'react/react-in-jsx-scope': 'off',
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }
    ],
  },
};
