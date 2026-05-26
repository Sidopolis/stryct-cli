import fs from "node:fs/promises";
import path from "node:path";
import { loadBlueprintConfig } from "../lib/config.js";
import { colorTokens, parseTokensCss } from "../lib/tokens.js";
import { findBlueprintRoot, readBlueprintFiles } from "../lib/workspace.js";

/** Map common arbitrary hex in className to first matching token (best-effort v0). */
export async function runAlign(cwd: string, targetFile?: string): Promise<void> {
  const root = await findBlueprintRoot(cwd);
  const config = await loadBlueprintConfig(root);
  const { tokensText } = await readBlueprintFiles(root);
  const colors = colorTokens(parseTokensCss(tokensText));

  const hexToToken = new Map<string, string>();
  for (const c of colors) {
    const hex = c.value.toLowerCase();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
      const tailwind = c.name.replace(/^--color-/, "");
      hexToToken.set(hex, tailwind);
    }
  }

  const scanRoot = targetFile
    ? path.resolve(root, targetFile)
    : path.join(root, config.paths.components);

  let filesChanged = 0;

  if (targetFile) {
    filesChanged += await alignFile(scanRoot, hexToToken, root);
  } else {
    await walkTsx(scanRoot, async (file) => {
      filesChanged += await alignFile(file, hexToToken, root);
    });
  }

  console.log(
    filesChanged
      ? `\nstryct align: updated ${filesChanged} file(s).`
      : "\nstryct align: no changes needed."
  );
}

async function alignFile(
  file: string,
  hexToToken: Map<string, string>,
  root: string
): Promise<number> {
  let text = await fs.readFile(file, "utf8");
  let changed = false;

  const re =
    /(bg|text|border|fill|stroke)-\[#([0-9a-fA-F]{3,8})\]/gi;
  const next = text.replace(re, (match, prop, hexDigits) => {
    const hex = `#${hexDigits.toLowerCase()}`;
    const token = hexToToken.get(hex);
    return token ? `${prop}-${token}` : match;
  });
  if (next !== text) {
    text = next;
    changed = true;
  }

  if (changed) {
    await fs.writeFile(file, text, "utf8");
    console.log(`  aligned ${path.relative(root, file)}`);
    return 1;
  }
  return 0;
}

async function walkTsx(
  dir: string,
  onFile: (file: string) => Promise<void>
): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      await walkTsx(full, onFile);
    } else if (/\.(tsx|jsx)$/.test(ent.name)) {
      await onFile(full);
    }
  }
}
