const VARIABLE_PATTERN = /\{\{([a-zA-Z0-9_\s-]+)\}\}/g;

export function extractVariables(content: string): string[] {
  const found = new Set<string>();
  for (const match of content.matchAll(VARIABLE_PATTERN)) {
    const name = match[1]?.trim();
    if (name) found.add(name);
  }
  return [...found];
}

export function applyVariables(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(VARIABLE_PATTERN, (_, name: string) => {
    const key = name.trim();
    return values[key] ?? `{{${key}}}`;
  });
}

export function nextVariablePlaceholder(existing: string[]): string {
  let index = 1;
  while (existing.includes(`variable_${index}`)) index += 1;
  return `variable_${index}`;
}
