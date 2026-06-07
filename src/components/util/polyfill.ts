export function replaceAll(str: string, search: string, replacement: string) {
  return str.split(search).join(replacement);
}
