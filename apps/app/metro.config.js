// Expo + npm workspaces monorepo config
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch only app, shared packages, and node_modules — avoids watching dynamic build folders in apps/api
config.watchFolders = [
  path.resolve(workspaceRoot, "packages"),
  path.resolve(workspaceRoot, "node_modules"),
  projectRoot,
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.blockList = [
  /.*[/\\]apps[/\\]api[/\\].*/,
  /.*[/\\]apps[/\\]admin[/\\].*/,
  /.*[/\\]apps[/\\]webar[/\\].*/,
];

module.exports = config;
