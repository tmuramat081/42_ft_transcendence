module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    'plugin:prettier/recommended', // Prettierとの競合を防ぐ
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off', // インターフェースの接頭辞はチェックしない
    '@typescript-eslint/explicit-function-return-type': 'off', // 返り値の型指定はチェックしない
    '@typescript-eslint/explicit-module-boundary-types': 'off', // エクスポートされる関数の型指定はチェックしない
    '@typescript-eslint/no-explicit-any': 1, // 明示的なany型を許可しない（警告)
    "indent": ["error", 2, { "SwitchCase": 1 }], // インデントは2スペース
    "semi": ["error", "always"], // セミコロンは必須
    "quotes": ["error", "single"], // シングルクォートのみ許可
    "indent": ["error", 2, { "ignoredNodes": ["PropertyDefinition"] }]
  },
  "overrides": [
    {
      "files": ["*.spec.ts"],
      "rules": {
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/require-await': 'off',
      }
    }
  ]
};
