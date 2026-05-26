import fs from "node:fs/promises";
import path from "node:path";
import { loadBlueprintConfig } from "../lib/config.js";
import { buildAgentRules } from "../lib/rules.js";
import { parseTokensCss } from "../lib/tokens.js";
import { findBlueprintRoot, readBlueprintFiles } from "../lib/workspace.js";

export async function runSync(cwd: string): Promise<void> {
  const root = await findBlueprintRoot(cwd);
  const config = await loadBlueprintConfig(root);
  const { tokensText } = await readBlueprintFiles(root);
  const body = buildAgentRules(config, parseTokensCss(tokensText));

  let wrote = 0;
  for (const [agentId, files] of Object.entries(config.agents)) {
    for (const rel of files) {
      const dest = path.join(root, rel);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, `${body}\n`, "utf8");
      console.log(`  wrote ${rel} (${agentId})`);
      wrote += 1;
    }
  }

  console.log(`\nstryct sync: ${wrote} rule file(s) updated.`);
}
