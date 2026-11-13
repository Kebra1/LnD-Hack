export function toggleComparison(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter((item) => item !== id);
  return ids.length >= 3 ? ids : [...ids, id];
}
