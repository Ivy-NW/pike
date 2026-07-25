/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  // Scoped to this feature's own tests for now — no other apps/api module has test
  // conventions established yet (see docs/progress.md).
  testMatch: ["<rootDir>/attestation/**/*.spec.ts"],
};
