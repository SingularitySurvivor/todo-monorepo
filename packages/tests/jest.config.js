module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 20000, // Increase timeout for API calls
  setupFiles: ['dotenv/config'],
  moduleNameMapper: {
    '^@market-research/api/(.*)$': '<rootDir>/../api/src/$1',
    '^@market-research/tests/(.*)$': '<rootDir>/src/$1'
  }
};