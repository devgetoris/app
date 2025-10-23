/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "es5",
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  endOfLine: "lf",
  arrowParens: "avoid",
  bracketSpacing: true,
  bracketSameLine: false,
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 120,
      },
    },
    {
      files: "*.md",
      options: {
        printWidth: 100,
        proseWrap: "always",
      },
    },
  ],
};

export default config;
