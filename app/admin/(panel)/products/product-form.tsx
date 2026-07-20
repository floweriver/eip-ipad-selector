// v1.0.0 | 2026-07-17 | 產品表單（新增/編輯共用）：欄位 + 相容機型勾選 + 群組一鍵套用
"use client";

import { useState, useTransition } from "react";
import { saveProduct, deleteProduct, type ProductInput } from "./actions";

export type Category = { id: string; name: string };
export type SeriesGroup = {
  id: string;
  name: string;
  models: { id: string; model_name: string }[];
};
export type CompatGroup = { id: string; name: string; modelIds: string[] };

export type ProductData = {
  id?: string;
  name: string;
  category_id: string;
  ranking: number | null;
  price: number | null;
  ean: string | null;
  image_link: string | null;
  website_link: string | null;
  shopee_link: string | null;
  original_link: string | null;
};

export default function ProductForm({
  mode,
  product,
  categories,
  series,
  groups,
  initialCompat,
}: {
  mode: "new" | "edit";
  product: ProductData;
  categories: Category[];
  series: SeriesGroup[];
  groups: CompatGroup[];
  initialCompat: string[];
}) {
  const [form, setForm] = useState<ProductData>(product);
  const [checked, setChecked] = useState<Set<string>>(new Set(initialCompat));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ProductData>(key: K, value: ProductData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleModel(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyGroup(g: CompatGroup) {
    setChecked((prev) => {
      const next = new Set(prev);
      g.modelIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function submit() {
    setError(null);
    const payload: ProductInput = {
      id: form.id,
      name: form.name,
      category_id: form.category_id,
      ranking: form.ranking,
      price: Number(form.price),
      ean: form.ean,
      image_link: form.image_link,
      website_link: form.website_link,
      shopee_link: form.shopee_link,
      original_link: form.original_link,
      modelIds: Array.from(checked),
    };
    startTransition(async () => {
      const result = await saveProduct(payload);
      if (result?.error) setError(result.error);
    });
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {/* 基本欄位 */}
      <div className="bg-white rounded-xl shadow p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block md:col-span-2">
          <span className="text-sm text-gray-600">產品名稱 *</span>
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">分類 *</span>
          <select className={inputCls} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
            <option value="">請選擇…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">價格（整數）*</span>
          <input
            type="number"
            className={inputCls}
            value={form.price ?? ""}
            onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={form.ranking != null}
            onChange={(e) => set("ranking", e.target.checked ? 1 : null)}
          />
          <span className="text-sm text-gray-700">顯示「推薦」徽章</span>
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">EAN 條碼（多筆用逗號分隔）</span>
          <input className={inputCls} value={form.ean ?? ""} onChange={(e) => set("ean", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">圖片連結</span>
          <input className={inputCls} value={form.image_link ?? ""} onChange={(e) => set("image_link", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">購買連結（lihi 短網址）</span>
          <input className={inputCls} value={form.website_link ?? ""} onChange={(e) => set("website_link", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">官網原始連結</span>
          <input className={inputCls} value={form.original_link ?? ""} onChange={(e) => set("original_link", e.target.value)} />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm text-gray-600">蝦皮連結</span>
          <input className={inputCls} value={form.shopee_link ?? ""} onChange={(e) => set("shopee_link", e.target.value)} />
        </label>
      </div>

      {/* 相容機型 */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-900">相容機型（已勾 {checked.size} 台）</h2>
          <button
            type="button"
            onClick={() => setChecked(new Set())}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            全部清空
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          先按群組一鍵套用，再逐台微調。群組只是輸入輔助，實際存的是下方勾選的每一台。
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {groups.filter((g) => g.modelIds.length > 0).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => applyGroup(g)}
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
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked.has(m.id)}
                      onChange={() => toggleModel(m.id)}
                    />
                    {m.model_name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 操作列 */}
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-lg bg-blue-600 text-white px-6 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "儲存中…" : "儲存"}
        </button>
        <a href="/admin/products" className="text-sm text-gray-500 hover:text-gray-800">取消</a>
        {mode === "edit" && form.id && (
          <form
            action={deleteProduct}
            className="ml-auto"
            onSubmit={(e) => {
              if (!confirm("確定要刪除這個產品？相容設定會一併刪除，無法復原。")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={form.id} />
            <button className="text-sm text-red-600 hover:underline">刪除產品</button>
          </form>
        )}
      </div>
    </div>
  );
}
