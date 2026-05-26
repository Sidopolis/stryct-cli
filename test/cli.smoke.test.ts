import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, "..", "dist", "cli.js");
const REPO_ROOT = path.join(__dirname, "..");

function runCli(args: string[], cwd: string): string {
  return execFileSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0" },
  });
}

function runCliFails(args: string[], cwd: string): void {
  assert.throws(() => runCli(args, cwd), (err: unknown) => {
    const e = err as { status?: number };
    return typeof e.status === "number" && e.status !== 0;
  });
}

function tempProject(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "stryct-test-"));
}

test("stryct --version", () => {
  const out = runCli(["--version"], REPO_ROOT);
  assert.match(out.trim(), /^0\.\d+\.\d+$/);
});

test("init → sync → export → lint pipeline", () => {
  const dir = tempProject();
  fs.writeFileSync(path.join(dir, "package.json"), '{"name":"test-app"}\n');

  runCli(["init"], dir);
  assert.ok(fs.existsSync(path.join(dir, "stryct.config.ts")));
  assert.ok(fs.existsSync(path.join(dir, "tokens.css")));
  assert.ok(fs.existsSync(path.join(dir, "src", "index.css")));

  runCli(["sync"], dir);
  assert.ok(fs.existsSync(path.join(dir, ".cursorrules")));

  runCli(["export", "--tokens"], dir);
  assert.ok(fs.existsSync(path.join(dir, "stryct.exports", "tokens.json")));

  runCli(["lint"], dir);
});

test("init refuses to overwrite existing config", () => {
  const dir = tempProject();
  fs.writeFileSync(path.join(dir, "package.json"), "{}");
  runCli(["init"], dir);
  runCliFails(["init"], dir);
});

test("align rewrites known hex to token class", () => {
  const dir = tempProject();
  fs.writeFileSync(path.join(dir, "package.json"), '{"name":"align-test"}');
  runCli(["init"], dir);

  const component = path.join(dir, "src", "components", "Widget.tsx");
  fs.writeFileSync(
    component,
    'export function W(){return <div className="bg-[#4d9fff]">x</div>;}\n',
    "utf8"
  );

  runCli(["align"], dir);
  const text = fs.readFileSync(component, "utf8");
  assert.match(text, /bg-accent/);
  assert.doesNotMatch(text, /bg-\[#4d9fff\]/);
});
