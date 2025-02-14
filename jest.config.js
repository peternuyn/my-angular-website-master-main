const nxPreset = require("@nx/jest/preset").default;

module.exports = {
  ...nxPreset,
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.js"], // Adjust path if necessary
  testMatch: ["**/+(*.)+(spec).+(ts)?(x)"],
  transform: {
    "^.+\\.(ts|html)$": [
      "jest-preset-angular",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
        stringifyContentPathRegex: "\\.html$",
      },
    ],
  },
  moduleFileExtensions: ["ts", "html", "js", "json"],
  coverageDirectory: "<rootDir>/coverage/",
  coverageReporters: ["text", "lcov"],
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts", "!src/polyfills.ts"],
};
