export type TokenEntry = {
  name: string;
  value: string;
};

export function parseTokensCss(css: string): TokenEntry[] {
  const entries: TokenEntry[] = [];
  const re = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(css)) !== null) {
    entries.push({
      name: match[1].trim(),
      value: match[2]
        .trim()
        .replace(/\r/g, "")
        .replace(/^["']|["']$/g, ""),
    });
  }
  return entries;
}

export function colorTokens(entries: TokenEntry[]): TokenEntry[] {
  return entries.filter((e) => e.name.startsWith("--color-"));
}

export function tailwindColorMap(entries: TokenEntry[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const { name, value } of colorTokens(entries)) {
    const key = name.replace(/^--color-/, "").replace(/-/g, "-");
    map[key] = `var(${name})`;
  }
  return map;
}
