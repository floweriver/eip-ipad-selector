// v1.0.0 | 2026-07-17 | Apple 品項表單（新增/編輯共用）：欄位 + 相容勾選 + 群組一鍵套用
"use client";

import { useState, useTransition } from "react";
import { saveApple, deleteApple, type AppleInput } from "./actions";
import type { Category, SeriesGroup, CompatGroup } from "../products/product-form";

export type AppleData = {
  id?: string;
  name: string;
  category_id: string;
  price: number | null;
};

export default function AppleForm({
  mode,
  item,
  categories,
  series,
  groups,
  initialCompat,
}: {
  mode: "new" | "edit";
  item: AppleData;
  categories: Category[];
  series: SeriesGroup[];
  groups: CompatGroup[];
  initialCompat: string[];
}) {
  const [form, setForm] = useState<AppleData>(item);
  const [checked, setChecked] = useState<Set<string>>(new Set(initialCompat));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleModel(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    setError(null);
    const payload: AppleInput = {
      id: form.id,
      name: form.name,
      category_id: form.category_id,
      price: Number(form.price),
      modelIds: Array.from(checked),
    };
    startTransition(async () => {
      const result = await saveApple(payload);
      if (result?.error) setError(result.error);
    });
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="bg-white rounded-xl shadow p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-sm text-gray-600">品名 *</span>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">分類 *</span>
          <select className={inputCls} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">請選擇…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">原廠價（整數）*</span>
          <input
            type="number"
            className={inputCls}
            value={form.price ?? ""}
            onChange={(e) => setForm({ ...form, price: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-900">相容機型（已勾 {checked.size} 台）</h2>
          <button type="button" onClick={() => setChecked(new Set())} className="text-sm text-gray-500 hover:text-red-600">
            全部清空
          </button>
        </div>
        <div className="flex flex-wrap gap-2 my-3">
          {groups.filter((g) => g.modelIds.length > 0).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() =>
                setChecked((prev) => {
                  const next = new Set(prev);
                  g.modelIds.forEach((id) => next.add(id));
                  return next;
                })
              }
              className="rounded-full border border-blue-300 text-blue-700 bg-blue-50 px-3 py-1 text-xs hover:bg-blue-100"
            >
              ＋ {g.name}（{g.modelIds.length}）
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {series.map((s) => (
            <div key={s.id}>
              <div className="text-sm font-semibold text-gray-700 mb-1.5">{s.name}</div>
              <div className="space-y-1">
                {s.models.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="h-4 w-4" checked={checked.has(m.id)} onChange={() => toggleModel(m.id)} />
                    {m.model_name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-lg bg-blue-600 text-white px-6 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "儲存中…" : "儲存"}
        </button>
        <a href="/admin/apple" className="text-sm text-gray-500 hover:text-gray-800">取消</a>
        {mode === "edit" && form.id && (
          <form
            action={deleteApple}
            className="ml-auto"
            onSubmit={(e) => {
              if (!confirm("確定要刪除這個 Apple 品項？")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={form.id} />
            <button className="text-sm text-red-600 hover:underline">刪除品項</button>
          </form>
        )}
      </div>
    </div>
  );
}
