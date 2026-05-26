import fs from "node:fs/promises";
import path from "node:path";
import { loadBlueprintConfig } from "../lib/config.js";
import { findBlueprintRoot, readBlueprintFiles } from "../lib/workspace.js";

type Issue = { level: "error" | "warn"; message: string };

export async function runLint(cwd: string): Promise<number> {
  const root = await findBlueprintRoot(cwd);
  const config = await loadBlueprintConfig(root);
  const issues: Issue[] = [];

  const { tokensText } = await readBlueprintFiles(root);
  if (!tokensText.trim()) {
    issues.push({ level: "error", message: "tokens.css is empty or missing." });
  }

  const componentsDir = path.join(root, config.paths.components);
  try {
    await fs.access(componentsDir);
  } catch {
    issues.push({
      level: "error",
      message: `Missing folder: ${config.paths.components}/`,
    });
  }

  const appCssPath = path.join(root, config.paths.appCss);
  try {
    const appCss = await fs.readFile(appCssPath, "utf8");
    if (
      !appCss.includes("tokens.css") &&
      !appCss.includes(config.paths.tokens)
    ) {
      issues.push({
        level: "error",
        message: `${config.paths.appCss} must import ${config.paths.tokens} before @tailwind layers.`,
      });
    }
  } catch {
    issues.push({
      level: "error",
      message: `Missing file: ${config.paths.appCss}`,
    });
  }

  await scanForRawHex(root, config.paths.components, issues);

  for (const issue of issues) {
    const tag = issue.level === "error" ? "error" : "warn";
    console.error(`  ${tag}: ${issue.message}`);
  }

  const errors = issues.filter((i) => i.level === "error").length;
  if (errors > 0) {
    console.error(`\nstryct lint: failed (${errors} error(s)).`);
    return 1;
  }

  const warns = issues.filter((i) => i.level === "warn").length;
  console.log(
    warns
      ? `\nstryct lint: passed with ${warns} warning(s).`
      : "\nstryct lint: passed."
  );
  return 0;
}

async function scanForRawHex(
  root: string,
  componentsRel: string,
  issues: Issue[]
): Promise<void> {
  const dir = path.join(root, componentsRel);
  try {
    await walkTsx(dir, async (file) => {
      const text = await fs.readFile(file, "utf8");
      if (/#[0-9a-fA-F]{3,8}\b/.test(text) || /bg-\[#/.test(text)) {
        issues.push({
          level: "warn",
          message: `Possible raw hex in ${path.relative(root, file)} (align will fix when shipped).`,
        });
      }
    });
  } catch {
    // no components yet
  }
}

async function walkTsx(
  dir: string,
  onFile: (file: string) => Promise<void>
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      await walkTsx(full, onFile);
    } else if (/\.(tsx|jsx|css)$/.test(ent.name)) {
      await onFile(full);
    }
  }
}
