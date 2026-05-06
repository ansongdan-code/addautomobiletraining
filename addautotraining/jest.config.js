module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/client/', '<rootDir>/server/'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
};
