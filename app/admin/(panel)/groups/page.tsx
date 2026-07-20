// v1.1.0 | 2026-07-20 | 相容群組管理：改名/排序 + 新增/刪除 + 成員一覽 + 匯出/匯入 CSV
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateGroup, addGroup, deleteGroup } from "./actions";
import CsvToolbar from "../io/csv-toolbar";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const { saved, err } = await searchParams;
  const db = supabaseAdmin();

  const [{ data: groups }, { data: models }] = await Promise.all([
    db.from("compat_groups").select("id, name, legacy_code, sort_order").order("sort_order"),
    db.from("ipad_models").select("id, model_name, group_id").order("sort_order"),
  ]);

  const inputCls = "rounded border border-gray-300 px-2 py-1 text-sm bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">相容群組（{groups?.length ?? 0}）</h1>
        <CsvToolbar table="groups" />
      </div>

      {saved && <p className="mb-4 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">已儲存 ✓</p>}
      {err && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      <p className="mb-4 text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        群組只是上架時的「一鍵套用」輔助，不承載相容性。要調整群組成員，請到「iPad 型號」頁改每台型號所屬的群組。
      </p>

      <div className="space-y-3 mb-6">
        {groups?.map((g) => {
          const members = models?.filter((m) => m.group_id === g.id) ?? [];
          return (
            <div key={g.id} className="bg-white rounded-xl shadow px-4 py-3">
              <form action={updateGroup} className="flex items-center gap-2 flex-wrap">
                <input type="hidden" name="id" value={g.id} />
                <input name="name" defaultValue={g.name} className={`${inputCls} w-56`} />
                <span className="text-xs text-gray-400">舊代碼：{g.legacy_code ?? "—"}</span>
                <input type="number" name="sort_order" defaultValue={g.sort_order} className={`${inputCls} w-16 ml-auto`} title="排序" />
                <button className="rounded bg-gray-800 text-white px-3 py-1 text-sm hover:bg-gray-700">儲存</button>
                <button formAction={deleteGroup} className="text-sm text-red-500 hover:underline px-1">刪除</button>
              </form>
              <p className="mt-2 text-xs text-gray-500">
                成員（{members.length}）：{members.length > 0 ? members.map((m) => m.model_name).join("、") : "（空群組）"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-gray-900 mb-3">新增群組</h2>
        <form action={addGroup} className="flex items-center gap-2 flex-wrap">
          <input name="name" placeholder="群組名稱（例：Pro 14吋）" className={`${inputCls} w-56`} />
          <input name="legacy_code" placeholder="代碼（選填）" className={`${inputCls} w-40`} />
          <input type="number" name="sort_order" defaultValue={99} className={`${inputCls} w-16`} title="排序" />
          <button className="rounded bg-blue-600 text-white px-4 py-1.5 text-sm hover:bg-blue-700">新增</button>
        </form>
      </div>
    </div>
  );
}
