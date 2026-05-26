# Stryct CLI v0.1.0

Blueprint CLI for frontend repos: **init**, **sync**, **export**, **lint**, **align**, **dev**, plus optional **stryct-mcp**.

**Two repos:** this is the **tool** only. The marketing/docs site lives in [Sidopolis/stryct](https://github.com/Sidopolis/stryct). See [REPOS.md](./REPOS.md).

[![CI](https://github.com/Sidopolis/stryct-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/Sidopolis/stryct-cli/actions/workflows/ci.yml)

## Quick start

```bash
cd stryct-cli
npm install
npm run build
npm link

cd ../my-app    # your React/Vite app (has package.json)
stryct init
stryct sync
stryct export --tokens
stryct lint
```

There is **no** `stryct install` command. **`init`** scaffolds your app.

`npx stryct init` works after the package is published to npm. Until then use `npm link`.

## Commands

| Command | What it does |
|---------|----------------|
| `stryct init` | Writes `stryct.config.ts`, `tokens.css`, `src/components/`, `src/index.css` (if missing) |
| `stryct sync` | Generates `.cursorrules`, `CLAUDE.md`, Copilot instructions, etc. from config |
| `stryct export --tokens` | Writes `stryct.exports/tokens.json` + Tailwind snippet |
| `stryct lint` | Checks tokens import, folders, raw hex warnings — exit 1 on errors |
| `stryct align` | Rewrites `bg-[#hex]` → `bg-accent` style classes (best-effort) |
| `stryct dev` | Watches config + tokens; re-runs lint + export on save |
| `stryct-mcp` | MCP tools: `stryct_get_config`, `stryct_list_tokens` |

## MCP (Cursor)

```json
{
  "mcpServers": {
    "stryct": {
      "command": "stryct-mcp",
      "env": { "STRYCT_ROOT": "${workspaceFolder}" }
    }
  }
}
```

## Honest limits (v0.1)

| Area | Status |
|------|--------|
| Commander CLI + `--help` | Yes — same pattern as typical OSS CLIs |
| npm publish / `npx stryct` | Not yet — use `npm link` locally |
| Automated tests | Not yet |
| `align` | Regex-based, not full AST |
| `export` | Writes snippet files; does not patch `tailwind.config.js` automatically |
| `sync` | Overwrites rule files (no merge) |
| Team cloud / dashboard | Not built |

## Tests & CI

```bash
npm test
```

GitHub Actions runs `npm test` on Node 20 and 22 (see `.github/workflows/ci.yml`).

## Publish to npm (once)

1. `npm login` (your npm account).
2. Confirm name `stryct` is still free: `npm view stryct` should 404.
3. From this repo: `npm publish --access public`.
4. Users can then run: `npx stryct init`.

## GitHub setup

```bash
cd stryct-cli
git init
git add .
git commit -m "feat: Stryct CLI v0.1 with tests and CI"
git branch -M main
git remote add origin https://github.com/Sidopolis/stryct-cli.git
git push -u origin main
```

Create the empty **private** repo `stryct-cli` on GitHub first (no README).

## GitHub

| Repo | Purpose |
|------|---------|
| [Sidopolis/stryct-cli](https://github.com/Sidopolis/stryct-cli) | This CLI (tool) |
| [Sidopolis/stryct](https://github.com/Sidopolis/stryct) | Website + docs only |
