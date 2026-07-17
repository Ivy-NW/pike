// Materializes theme.css from the TS tokens into each Next.js app.
// Re-run (npm run generate:css) whenever packages/design-tokens/src changes.
const fs = require("fs");
const path = require("path");
const { generateThemeCss } = require("../dist/theme");

const header = `/* GENERATED FILE — do not hand-edit.
 * Source: packages/design-tokens/src (palette.ts, typography.ts, shape.ts, theme.ts)
 * Regenerate with: npm run generate:css --workspace packages/design-tokens
 */
`;

const targets = [
  "../../../apps/web/src/app/theme.css",
  "../../../apps/dashboard/src/app/theme.css",
  "../../../apps/admin/src/app/theme.css",
  "../../../apps/webar/src/theme.css",
];

const css = header + generateThemeCss();

for (const target of targets) {
  const dest = path.resolve(__dirname, target);
  fs.writeFileSync(dest, css);
  console.log("wrote", dest);
}
