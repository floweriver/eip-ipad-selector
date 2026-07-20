// v1.0.0 | 2026-07-17 | 產品表單共用資料查詢（分類、系列+型號、群組成員）
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Category, SeriesGroup, CompatGroup } from "./product-form";

export async function loadFormData(): Promise<{
  categories: Category[];
  series: SeriesGroup[];
  groups: CompatGroup[];
}> {
  const db = supabaseAdmin();

  const [{ data: categories }, { data: seriesRows }, { data: modelRows }, { data: groupRows }] =
    await Promise.all([
      db.from("categories").select("id, name").order("sort_order"),
      db.from("ipad_series").select("id, name").order("sort_order"),
      db.from("ipad_models").select("id, model_name, series_id, group_id").order("sort_order"),
      db.from("compat_groups").select("id, name").order("sort_order"),
    ]);

  const series: SeriesGroup[] = (seriesRows ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    models: (modelRows ?? [])
      .filter((m) => m.series_id === s.id)
      .map((m) => ({ id: m.id, model_name: m.model_name })),
  }));

  const groups: CompatGroup[] = (groupRows ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    modelIds: (modelRows ?? []).filter((m) => m.group_id === g.id).map((m) => m.id),
  }));

  return { categories: categories ?? [], series, groups };
}
