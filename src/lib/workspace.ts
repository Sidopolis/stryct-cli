import fs from "node:fs/promises";
import path from "node:path";

const CONFIG_NAME = "stryct.config.ts";

export function resolveWorkspaceRoot(): string {
  const fromEnv = process.env.STRYCT_ROOT;
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  return process.cwd();
}

export async function findBlueprintRoot(startDir: string): Promise<string> {
  let dir = path.resolve(startDir);
  const root = path.parse(dir).root;

  while (true) {
    const configPath = path.join(dir, CONFIG_NAME);
    try {
      await fs.access(configPath);
      return dir;
    } catch {
      // keep walking up
    }
    if (dir === root) {
      throw new Error(
        `No ${CONFIG_NAME} found. Run stryct init in your project root or set STRYCT_ROOT.`
      );
    }
    dir = path.dirname(dir);
  }
}

export async function readBlueprintFiles(root: string): Promise<{
  configPath: string;
  tokensPath: string;
  configText: string;
  tokensText: string;
}> {
  const configPath = path.join(root, CONFIG_NAME);
  const tokensPath = path.join(root, "tokens.css");

  const configText = await fs.readFile(configPath, "utf8");

  let tokensText: string;
  try {
    tokensText = await fs.readFile(tokensPath, "utf8");
  } catch {
    tokensText = "";
  }

  return { configPath, tokensPath, configText, tokensText };
}

export function listTokenNames(tokensCss: string): string[] {
  const names = new Set<string>();
  const re = /--([a-zA-Z0-9-]+)\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(tokensCss)) !== null) {
    names.add(`--${match[1]}`);
  }
  return [...names].sort();
}
