// v1.0.0 | 2026-07-17 | iPad 型號管理：逐列編輯（名稱/群組/顯示/排序）＋ 新增/刪除
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateModel, addModel, deleteModel } from "./actions";

export default async function ModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const { saved, err } = await searchParams;
  const db = supabaseAdmin();

  const [{ data: series }, { data: models }, { data: groups }] = await Promise.all([
    db.from("ipad_series").select("id, name, sort_order").order("sort_order"),
    db.from("ipad_models").select("id, model_name, series_id, group_id, is_active, sort_order").order("sort_order"),
    db.from("compat_groups").select("id, name").order("sort_order"),
  ]);

  const inputCls = "rounded border border-gray-300 px-2 py-1 text-sm bg-white";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">iPad 型號（{models?.length ?? 0}）</h1>

      {saved && <p className="mb-4 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">已儲存 ✓</p>}
      {err && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      <p className="mb-4 text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        ⚠️ 型號名稱是相容對照的基準，前台上線後盡量不要改名。「顯示」關掉＝前台選不到這台，但相容資料保留。
      </p>

      {series?.map((s) => (
        <div key={s.id} className="mb-6">
          <h2 className="font-bold text-gray-700 mb-2">{s.name}</h2>
          <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
            {models
              ?.filter((m) => m.series_id === s.id)
              .map((m) => (
                <form key={m.id} action={updateModel} className="flex items-center gap-2 px-4 py-2.5 flex-wrap">
                  <input type="hidden" name="id" value={m.id} />
                  <input name="model_name" defaultValue={m.model_name} className={`${inputCls} flex-1 min-w-56`} />
                  <select name="group_id" defaultValue={m.group_id} className={inputCls}>
                    {groups?.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input type="checkbox" name="is_active" defaultChecked={m.is_active} className="h-4 w-4" />
                    顯示
                  </label>
                  <input type="number" name="sort_order" defaultValue={m.sort_order} className={`${inputCls} w-16`} title="排序" />
                  <button className="rounded bg-gray-800 text-white px-3 py-1 text-sm hover:bg-gray-700">儲存</button>
                  <button formAction={deleteModel} className="text-sm text-red-500 hover:underline px-1">刪除</button>
                </form>
              ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-gray-900 mb-3">新增型號</h2>
        <form action={addModel} className="flex items-center gap-2 flex-wrap">
          <input name="model_name" placeholder="型號名稱（比照 Apple 官方，含尺寸）" className={`${inputCls} flex-1 min-w-64`} />
          <select name="series_id" className={inputCls}>
            {series?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select name="group_id" className={inputCls}>
            {groups?.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <input type="number" name="sort_order" defaultValue={99} className={`${inputCls} w-16`} title="排序" />
          <button className="rounded bg-blue-600 text-white px-4 py-1.5 text-sm hover:bg-blue-700">新增</button>
        </form>
      </div>
    </div>
  );
}
