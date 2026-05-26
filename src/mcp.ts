#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  findBlueprintRoot,
  listTokenNames,
  readBlueprintFiles,
  resolveWorkspaceRoot,
} from "./lib/workspace.js";

const server = new McpServer({
  name: "stryct-mcp",
  version: "0.0.1",
});

server.registerTool(
  "stryct_get_config",
  {
    description:
      "Read stryct.config.ts and tokens.css from the workspace (read-only).",
    inputSchema: z.object({}),
  },
  async () => {
    const root = await findBlueprintRoot(resolveWorkspaceRoot());
    const { configPath, tokensPath, configText, tokensText } =
      await readBlueprintFiles(root);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              root,
              configPath,
              tokensPath,
              config: configText,
              tokens: tokensText,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.registerTool(
  "stryct_list_tokens",
  {
    description:
      "List CSS custom property names from tokens.css (e.g. --color-accent).",
    inputSchema: z.object({}),
  },
  async () => {
    const root = await findBlueprintRoot(resolveWorkspaceRoot());
    const { tokensText } = await readBlueprintFiles(root);
    const tokens = listTokenNames(tokensText);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ root, tokens }, null, 2),
        },
      ],
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("stryct-mcp running on stdio (read-only blueprint tools)");
}

main().catch((err) => {
  console.error("stryct-mcp:", err instanceof Error ? err.message : err);
  process.exit(1);
});
