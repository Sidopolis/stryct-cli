import { createJiti } from "jiti";
import path from "node:path";

export type BlueprintPaths = {
  tokens: string;
  components: string;
  componentsUi?: string;
  appCss: string;
};

export type BlueprintConfig = {
  version?: number;
  stack?: {
    framework?: string;
    typescript?: boolean;
    tailwind?: boolean;
  };
  paths: BlueprintPaths;
  agents: Record<string, string[]>;
};

export async function loadBlueprintConfig(
  root: string
): Promise<BlueprintConfig> {
  const configPath = path.join(root, "stryct.config.ts");
  const jiti = createJiti(import.meta.url);
  const mod = (await jiti.import(configPath)) as
    | { default?: BlueprintConfig }
    | BlueprintConfig;
  const raw: BlueprintConfig =
    "default" in mod && mod.default ? mod.default : (mod as BlueprintConfig);

  if (!raw?.paths || !raw?.agents) {
    throw new Error("stryct.config.ts must export paths and agents.");
  }

  return raw as BlueprintConfig;
}
