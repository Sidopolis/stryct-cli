# Stryct — two repositories

Stryct uses **two separate GitHub repos** on purpose. Do not merge them into one.

```
┌─────────────────────────────────────────────────────────────┐
│  Repo 1: stryct (website)                                   │
│  GitHub: github.com/Sidopolis/stryct                        │
│  Folder on your PC: Downloads/Suko                          │
│  What it is: Docs + landing (Vite/React). Static site.        │
│  You run: npm run dev / npm run build                       │
│  Visibility: private is fine until launch                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Repo 2: stryct-cli (tool)                                  │
│  GitHub: github.com/Sidopolis/stryct-cli  ← create & push   │
│  Folder on your PC: Downloads/stryct-cli                    │
│  What it is: npm package `stryct` — init, sync, lint, MCP   │
│  You run: stryct init inside *your app*, not in this folder │
│  Visibility: private until npm publish, then public is normal │
└─────────────────────────────────────────────────────────────┘

## What goes where

| File / concern | Website repo (`stryct`) | CLI repo (`stryct-cli`) |
|----------------|-------------------------|-------------------------|
| Landing page, `/docs` | Yes | No |
| `stryct init` source code | No | Yes |
| `package.json` name | `stryct` site project | npm package `stryct` |
| Deploy to Vercel | Yes | No |
| `npx stryct init` | No (calls CLI package) | Yes (after npm publish) |

## Typical workflow

1. **Develop CLI** in `stryct-cli` → push to `Sidopolis/stryct-cli` → CI runs tests.
2. **Develop site** in `Suko` → push to `Sidopolis/stryct` → deploy.
3. **Use product** in any React app: `cd my-app && npx stryct init`.

## npm

- Package name: `stryct`
- Published from **stryct-cli** only.
- Website install docs link to npm after first publish.
