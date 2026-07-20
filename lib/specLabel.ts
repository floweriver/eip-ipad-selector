// v1.0.0 | 2026-07-20 | 依相容機型清單歸納出精簡規格標籤（整群→群組名；零星→型號名）
export type LabelGroup = { id: string; name: string; memberIds: string[] };

export function specLabel(
  modelIds: string[],
  groups: LabelGroup[],
  modelNameById: Map<string, string>,
  totalModels: number
): string {
  if (modelIds.length === 0) return "未設定相容";
  if (modelIds.length === totalModels) return "全機型通用";

  const idSet = new Set(modelIds);
  const parts: string[] = [];
  const remaining = new Set(modelIds);

  for (const g of groups) {
    if (g.memberIds.length > 0 && g.memberIds.every((m) => idSet.has(m))) {
      parts.push(g.name);
      g.memberIds.forEach((m) => remaining.delete(m));
    }
  }
  for (const m of remaining) {
    parts.push(modelNameById.get(m) ?? "?");
  }

  if (parts.length > 4) return `通用 ${modelIds.length} 台`;
  return parts.join("、");
}
