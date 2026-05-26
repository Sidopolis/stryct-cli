/**
 * Stryct blueprint — source of truth for tokens, paths, and agent rules.
 * @see https://github.com/Sidopolis/stryct
 */
export default {
  version: 1,
  stack: {
    framework: "react",
    typescript: true,
    tailwind: true,
  },
  paths: {
    tokens: "tokens.css",
    components: "src/components",
    componentsUi: "src/components/ui",
    appCss: "src/index.css",
  },
  tokens: {
    prefix: "--color-",
    accent: "accent",
    paper: "paper",
  },
  agents: {
    cursor: [".cursorrules"],
    claude: ["CLAUDE.md"],
    copilot: [".github/copilot-instructions.md"],
    windsurf: [".windsurfrules"],
  },
} as const;
