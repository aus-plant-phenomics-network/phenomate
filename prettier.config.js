//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  useTabs: false,
  bracketSameLine: false,
  arrowParens: 'avoid',
  overrides: [
    {
      files: ['*.mjs', '*.cjs', '*.js'],
      options: {
        parser: 'babel',
      },
    },

    {
      files: ['*.mts', '*.cts', '*.ts'],
      options: {
        parser: 'typescript',
      },
    },

    {
      files: ['*.json', '*.jsonc', '*.json5'],
      options: {
        parser: 'json',
      },
    },
  ],
}

export default config
