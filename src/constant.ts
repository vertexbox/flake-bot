export const defaultLables = [
  "fix",
  "feat",
  "feature",
  "patch",
  "hotfix",
  "ci",
  "optimize",
  "refactor",
  "style",
  "doc",
  "docs",
  "mock",
  "fixture",
  "chore",
  "test",
  "api",
];

export const checkerExemptionLabels = [
  "style",
  "fixture",
  "chore",
  "documentation",
  "automated-pr",
  "release:auto",
];

export const documentationAllowedFileExts = ["md"];

export const strictLabels = defaultLables.slice(0, -5);
