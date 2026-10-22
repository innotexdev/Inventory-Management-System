export function requireId(map: Map<string, string>, key: string): string {
  const id = map.get(key);

  if (id === undefined) {
    throw new Error(`Missing ID for key: ${key}`);
  }

  return id;
}
