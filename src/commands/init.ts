import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, "..", "..", "templates");

const TEMPLATE_FILES = ["stryct.config.ts", "tokens.css"] as const;

export async function runInit(cwd: string): Promise<void> {
  const pkgPath = path.join(cwd, "package.json");
  try {
    await fs.access(pkgPath);
  } catch {
    throw new Error(
      "No package.json found. Run stryct init from your project root."
    );
  }

  const configPath = path.join(cwd, "stryct.config.ts");
  try {
    await fs.access(configPath);
    throw new Error(
      "stryct.config.ts already exists. Remove it first if you want a fresh scaffold."
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("already exists")) {
      throw err;
    }
  }

  for (const file of TEMPLATE_FILES) {
    const src = path.join(TEMPLATES_DIR, file);
    const dest = path.join(cwd, file);
    const content = await fs.readFile(src, "utf8");
    await fs.writeFile(dest, content, "utf8");
    console.log(`  wrote ${file}`);
  }

  const componentsDir = path.join(cwd, "src", "components");
  await fs.mkdir(componentsDir, { recursive: true });
  const gitkeep = path.join(componentsDir, ".gitkeep");
  try {
    await fs.access(gitkeep);
  } catch {
    await fs.writeFile(gitkeep, "", "utf8");
  }
  console.log("  created src/components/");

  const indexCss = path.join(cwd, "src", "index.css");
  try {
    await fs.access(indexCss);
  } catch {
    await fs.mkdir(path.join(cwd, "src"), { recursive: true });
    await fs.writeFile(
      indexCss,
      '@import "../tokens.css";\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n',
      "utf8"
    );
    console.log("  wrote src/index.css");
  }

  console.log("\nStryct blueprint scaffolded.");
  console.log("Next:");
  console.log("  1. Edit stryct.config.ts for your paths and stack.");
  console.log("  2. Import tokens in src/index.css: @import \"../tokens.css\";");
  console.log("  3. Map Tailwind colors to var(--color-*) in tailwind.config.");
  console.log("  4. Run stryct sync, then stryct export --tokens");
}
