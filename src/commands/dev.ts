import path from "node:path";
import { runExportTokens } from "./export.js";
import { runLint } from "./lint.js";
import { findBlueprintRoot } from "../lib/workspace.js";
import { loadBlueprintConfig } from "../lib/config.js";

export async function runDev(cwd: string): Promise<void> {
  const root = await findBlueprintRoot(cwd);
  const config = await loadBlueprintConfig(root);

  const watchPaths = [
    path.join(root, "stryct.config.ts"),
    path.join(root, config.paths.tokens),
  ];

  console.log("stryct dev: watching blueprint files (Ctrl+C to stop)\n");
  for (const p of watchPaths) {
    console.log(`  · ${path.relative(root, p)}`);
  }

  const check = async (label: string) => {
    console.log(`\n[${label}]`);
    const code = await runLint(root);
    if (code === 0) {
      await runExportTokens(root);
    }
  };

  await check("initial");

  const { watch } = await import("node:fs");
  for (const file of watchPaths) {
    watch(file, { persistent: true }, (event) => {
      if (event === "change") {
        void check(path.basename(file));
      }
    });
  }

  await new Promise(() => {
    /* keep process alive */
  });
}
