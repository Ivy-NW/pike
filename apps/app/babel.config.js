const path = require("path");

/**
 * @expo/cli normally computes and injects process.env.EXPO_ROUTER_APP_ROOT /
 * EXPO_ROUTER_IMPORT_MODE itself before Metro transforms expo-router's _ctx.*.js files.
 * In this npm-workspaces monorepo that auto-injection isn't reaching the transform step
 * (reproducible even with --max-workers 1, so it isn't a worker env-inheritance issue) —
 * expo-router/_ctx.android.js ends up with the literal, un-substituted
 * `process.env.EXPO_ROUTER_APP_ROOT` member expression, which crashes Metro's
 * require.context static analysis ("First argument ... should be a string"). Inlining
 * these two specific vars ourselves sidesteps whatever is breaking the built-in injection.
 */
function inlineExpoRouterEnvPlugin({ types: t }) {
  // Metro's require.context resolves this relative to the calling file
  // (node_modules/expo-router/_ctx.android.js), not as a literal filesystem path —
  // an absolute "C:/..." path silently matched zero files. Forward slashes only,
  // same class of bug as the entry-bundle path issue.
  const appRoot = path.join(__dirname, "app");
  const fromCtxFile = path.join(__dirname, "node_modules", "expo-router");
  const relativeAppRoot = path.relative(fromCtxFile, appRoot).split(path.sep).join("/");

  const values = {
    EXPO_ROUTER_APP_ROOT: relativeAppRoot,
    EXPO_ROUTER_IMPORT_MODE: "lazy",
  };
  return {
    visitor: {
      MemberExpression(nodePath) {
        const { node } = nodePath;
        if (
          t.isMemberExpression(node.object) &&
          t.isIdentifier(node.object.object, { name: "process" }) &&
          t.isIdentifier(node.object.property, { name: "env" }) &&
          t.isIdentifier(node.property) &&
          Object.prototype.hasOwnProperty.call(values, node.property.name)
        ) {
          nodePath.replaceWith(t.stringLiteral(values[node.property.name]));
        }
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [inlineExpoRouterEnvPlugin],
  };
};
