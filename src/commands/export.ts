import fs from "node:fs/promises";
import path from "node:path";
import { loadBlueprintConfig } from "../lib/config.js";
import {
  parseTokensCss,
  tailwindColorMap,
} from "../lib/tokens.js";
import { findBlueprintRoot, readBlueprintFiles } from "../lib/workspace.js";

export async function runExportTokens(cwd: string): Promise<void> {
  const root = await findBlueprintRoot(cwd);
  const config = await loadBlueprintConfig(root);
  const { tokensPath, tokensText } = await readBlueprintFiles(root);
  const entries = parseTokensCss(tokensText);
  const colors = tailwindColorMap(entries);

  const outDir = path.join(root, "stryct.exports");
  await fs.mkdir(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "tokens.json");
  const json = Object.fromEntries(
    entries.map((e) => [e.name, e.value])
  );
  await fs.writeFile(jsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log(`  wrote stryct.exports/tokens.json`);

  const snippetPath = path.join(outDir, "tailwind-theme-snippet.js");
  const snippet = [
    "// Paste under theme.extend in tailwind.config.js",
    "// Generated from " + config.paths.tokens,
    "colors: " + JSON.stringify(colors, null, 2) + ",",
    "",
  ].join("\n");
  await fs.writeFile(snippetPath, snippet, "utf8");
  console.log(`  wrote stryct.exports/tailwind-theme-snippet.js`);

  const importHint = config.paths.appCss;
  const cssPath = path.join(root, importHint);
  try {
    const appCss = await fs.readFile(cssPath, "utf8");
    const tokenRef = config.paths.tokens.replace(/^\.\//, "");
    const importLine = `@import "../${path.basename(config.paths.tokens)}";`;
    if (!appCss.includes(tokenRef) && !appCss.includes("tokens.css")) {
      console.warn(
        `\n  warn: ${importHint} does not import ${config.paths.tokens}. Add:\n  ${importLine}\n  (adjust path if your CSS file lives elsewhere.)`
      );
    }
  } catch {
    console.warn(`  warn: could not read ${importHint}`);
  }

  console.log(`\nstryct export: done (${entries.length} tokens from ${tokensPath}).`);
}
