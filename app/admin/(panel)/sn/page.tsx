// v1.0.0 | 2026-07-17 | A 碼對照管理：搜尋 + 逐列改型號 + 新增/刪除
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { addSn, updateSn, deleteSn } from "./actions";

export default async function SnPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; saved?: string; err?: string }>;
}) {
  const { q, saved, err } = await searchParams;
  const db = supabaseAdmin();

  const [{ data: models }, snQuery] = await Promise.all([
    db.from("ipad_models").select("id, model_name").order("sort_order"),
    (q
      ? db.from("sn_codes").select("id, sn, model_id").ilike("sn", `%${q}%`)
      : db.from("sn_codes").select("id, sn, model_id")
    ).order("sn"),
  ]);
  const sns = snQuery.data;

  const inputCls = "rounded border border-gray-300 px-2 py-1 text-sm bg-white";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">A 碼對照（{sns?.length ?? 0}）</h1>

      {saved && <p className="mb-4 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">已儲存 ✓</p>}
      {err && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <form className="flex gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="搜尋 A 碼…" className={`${inputCls} w-40`} />
          <button className="rounded bg-gray-800 text-white px-3 py-1 text-sm">搜尋</button>
          {q && <a href="/admin/sn" className="text-sm text-gray-500 self-center hover:text-gray-800">清除</a>}
        </form>

        <form action={addSn} className="flex gap-2">
          <input name="sn" placeholder="新 A 碼（例 A3466）" className={`${inputCls} w-40`} />
          <select name="model_id" className={inputCls}>
            {models?.map((m) => (
              <option key={m.id} value={m.id}>{m.model_name}</option>
            ))}
          </select>
          <button className="rounded bg-blue-600 text-white px-4 py-1 text-sm hover:bg-blue-700">新增</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
        {sns?.map((s) => (
          <form key={s.id} action={updateSn} className="flex items-center gap-3 px-4 py-2">
            <input type="hidden" name="id" value={s.id} />
            <span className="font-mono text-sm w-16 text-gray-900">{s.sn}</span>
            <select name="model_id" defaultValue={s.model_id} className={`${inputCls} flex-1 max-w-72`}>
              {models?.map((m) => (
                <option key={m.id} value={m.id}>{m.model_name}</option>
              ))}
            </select>
            <button className="rounded bg-gray-800 text-white px-3 py-1 text-sm hover:bg-gray-700">儲存</button>
            <button formAction={deleteSn} className="text-sm text-red-500 hover:underline">刪除</button>
          </form>
        ))}
        {(!sns || sns.length === 0) && (
          <p className="px-4 py-8 text-center text-gray-400 text-sm">沒有符合的 A 碼</p>
        )}
      </div>
    </div>
  );
}
