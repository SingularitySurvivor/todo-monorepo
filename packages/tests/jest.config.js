export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 20000, // Increase timeout for API calls
  setupFiles: ['dotenv/config'],
  resolver: '<rootDir>/jest-resolver.cjs',
  moduleNameMapper: {
    '^@todo-app/api/(.*)$': '<rootDir>/../api/src/$1',
    '^@todo-app/tests/(.*)$': '<rootDir>/src/$1',
    '^@todo-app/client-common$': '<rootDir>/../client-common/src/index.ts'
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@todo-app/client-common)/)'
  ]
};