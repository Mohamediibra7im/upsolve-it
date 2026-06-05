/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      jsx: 'react-jsx',
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library|react-markdown|remark-|rehype-|unified|bail|is-plain-obj|trough|micromark|decode-named-character-reference|character-entities|property-information|comma-separated-tokens|space-separated-tokens|hast-util-|mdast-util-)/)',
  ],
};

module.exports = require('next/jest')({ dir: './' })(config);
