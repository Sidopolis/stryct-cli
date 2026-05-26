#!/usr/bin/env node
import { Command } from "commander";
import { runAlign } from "./commands/align.js";
import { runDev } from "./commands/dev.js";
import { runExportTokens } from "./commands/export.js";
import { runInit } from "./commands/init.js";
import { runLint } from "./commands/lint.js";
import { runSync } from "./commands/sync.js";

const program = new Command();

program
  .name("stryct")
  .description("Agent control plane for frontend repos")
  .version("0.1.0");

function fail(prefix: string, err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`${prefix}: ${message}`);
  process.exit(1);
}

program
  .command("init")
  .description("Scaffold stryct.config.ts, tokens.css, and src/components/")
  .action(async () => {
    try {
      await runInit(process.cwd());
    } catch (err) {
      fail("stryct init", err);
    }
  });

program
  .command("sync")
  .description("Generate editor rule files from stryct.config.ts")
  .action(async () => {
    try {
      await runSync(process.cwd());
    } catch (err) {
      fail("stryct sync", err);
    }
  });

program
  .command("export")
  .description("Export token artifacts")
  .option("--tokens", "Write tokens.json and Tailwind snippet")
  .action(async (opts: { tokens?: boolean }) => {
    if (!opts.tokens) {
      console.error("stryct export: use --tokens");
      process.exit(1);
    }
    try {
      await runExportTokens(process.cwd());
    } catch (err) {
      fail("stryct export", err);
    }
  });

program
  .command("lint")
  .description("Check blueprint drift (exit 1 on failure)")
  .action(async () => {
    try {
      const code = await runLint(process.cwd());
      process.exit(code);
    } catch (err) {
      fail("stryct lint", err);
    }
  });

program
  .command("align")
  .description("Rewrite arbitrary hex classes to token utilities (best-effort)")
  .argument("[file]", "Optional path to one TSX file")
  .action(async (file?: string) => {
    try {
      await runAlign(process.cwd(), file);
    } catch (err) {
      fail("stryct align", err);
    }
  });

program
  .command("dev")
  .description("Watch blueprint files; re-run lint and export on change")
  .action(async () => {
    try {
      await runDev(process.cwd());
    } catch (err) {
      fail("stryct dev", err);
    }
  });

program.parse();
