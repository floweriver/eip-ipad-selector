// v1.0.0 | 2026-07-20 | 前台一頁式互動：選系列 → 選型號（或 A 碼）→ 比價 + 配件推薦（Apple 官網風格）
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type FrontData = {
  series: { id: string; name: string; image_url: string | null; sort_order: number }[];
  models: { id: string; series_id: string; model_name: string; sort_order: number }[];
  categories: { id: string; name: string; sort_order: number }[];
  products: {
    id: string;
    category_id: string;
    name: string;
    ranking: number | null;
    price: number;
    image_link: string | null;
    website_link: string | null;
    original_link: string | null;
    shopee_link: string | null;
  }[];
  compat: { product_id: string; model_id: string }[];
  apple: { id: string; category_id: string; name: string; price: number }[];
  appleCompat: { apple_product_id: string; model_id: string }[];
  sns: { sn: string; model_id: string }[];
};

const NT = (n: number) => "NT$" + n.toLocaleString("zh-TW");

export default function HomeClient({ data }: { data: FrontData }) {
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [catId, setCatId] = useState<string | null>(null);
  const [snInput, setSnInput] = useState("");
  const [snError, setSnError] = useState<string | null>(null);

  const modelRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 選了系列 → 捲到型號區；選了型號 → 捲到結果區
  useEffect(() => {
    if (seriesId && !modelId) modelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [seriesId, modelId]);
  useEffect(() => {
    if (modelId) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [modelId, catId]);

  const model = data.models.find((m) => m.id === modelId) ?? null;

  // 該型號相容的 eiP 產品
  const compatProducts = useMemo(() => {
    if (!modelId) return [];
    const ids = new Set(data.compat.filter((c) => c.model_id === modelId).map((c) => c.product_id));
    return data.products
      .filter((p) => ids.has(p.id))
      .sort((a, b) => (a.ranking != null ? 0 : 1) - (b.ranking != null ? 0 : 1) || a.price - b.price);
  }, [modelId, data]);

  // 該型號相容的 Apple 品項
  const compatApple = useMemo(() => {
    if (!modelId) return [];
    const ids = new Set(data.appleCompat.filter((c) => c.model_id === modelId).map((c) => c.apple_product_id));
    return data.apple.filter((a) => ids.has(a.id));
  }, [modelId, data]);

  // 有產品的分類（依 sort_order），與目前選中的分類
  const activeCats = useMemo(
    () => data.categories.filter((c) => compatProducts.some((p) => p.category_id === c.id)),
    [compatProducts, data.categories]
  );
  const currentCat = activeCats.find((c) => c.id === catId) ?? activeCats[0] ?? null;

  // 比價：每分類 eiP 最低 vs Apple 最低
  const savings = useMemo(() => {
    const rows = activeCats
      .map((c) => {
        const eipMin = Math.min(...compatProducts.filter((p) => p.category_id === c.id).map((p) => p.price));
        const apples = compatApple.filter((a) => a.category_id === c.id);
        if (apples.length === 0) return null;
        const appleMin = Math.min(...apples.map((a) => a.price));
        const diff = appleMin - eipMin;
        return diff > 0 ? { cat: c.name, eipMin, appleMin, diff } : null;
      })
      .filter(Boolean) as { cat: string; eipMin: number; appleMin: number; diff: number }[];
    return { rows, total: rows.reduce((s, r) => s + r.diff, 0) };
  }, [activeCats, compatProducts, compatApple]);

  function lookupSn() {
    const key = snInput.trim().toUpperCase();
    if (!key) return;
    const hit = data.sns.find((s) => s.sn.toUpperCase() === key);
    if (!hit) {
      setSnError(`查不到「${key}」，請確認 iPad 背面的型號（A 開頭 + 4 位數字）`);
      return;
    }
    const m = data.models.find((x) => x.id === hit.model_id);
    if (!m) {
      setSnError("這個型號目前未提供查詢");
      return;
    }
    setSnError(null);
    setSeriesId(m.series_id);
    setModelId(m.id);
    setCatId(null);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      {/* Hero */}
      <header className="text-center px-6 pt-16 pb-10">
        <p className="text-sm font-semibold text-[#0071e3] mb-2">eiP 挑 iPad 配件</p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          三步驟，找到最適合
          <br className="md:hidden" />
          你 iPad 的配件。
        </h1>
        <p className="mt-4 text-lg text-[#6e6e73]">選好你的 iPad，配件與省下的錢，一次算給你看。</p>
      </header>

      {/* Step 1：選系列 */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <h2 className="text-2xl font-semibold tracking-tight mb-5">
          <span className="text-[#0071e3]">1.</span> 你的 iPad 是哪個系列？
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.series.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSeriesId(s.id);
                setModelId(null);
                setCatId(null);
                setSnError(null);
              }}
              className={`bg-white rounded-2xl p-5 text-center transition shadow-sm hover:shadow-md ${
                seriesId === s.id ? "ring-2 ring-[#0071e3]" : ""
              }`}
            >
              {s.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image_url} alt={s.name} className="h-24 md:h-28 mx-auto object-contain mb-3" />
              )}
              <div className="font-semibold">{s.name}</div>
            </button>
          ))}
        </div>

        {/* A 碼查詢 */}
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <div className="font-semibold">不知道是哪一台？</div>
            <div className="text-sm text-[#6e6e73]">看 iPad 背面小字的型號（A 開頭），輸入就幫你找。</div>
          </div>
          <div className="flex gap-2">
            <input
              value={snInput}
              onChange={(e) => setSnInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupSn()}
              placeholder="例：A2902"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#0071e3] bg-white"
            />
            <button
              onClick={lookupSn}
              className="rounded-full bg-[#0071e3] text-white px-5 py-2 text-sm font-medium hover:bg-[#0077ed]"
            >
              查詢
            </button>
          </div>
        </div>
        {snError && <p className="mt-3 text-sm text-red-600">{snError}</p>}
      </section>

      {/* Step 2：選型號 */}
      {seriesId && (
        <section ref={modelRef} className="max-w-5xl mx-auto px-6 pb-14 scroll-mt-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-5">
            <span className="text-[#0071e3]">2.</span> 哪一台{" "}
            {data.series.find((s) => s.id === seriesId)?.name}？
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {data.models
              .filter((m) => m.series_id === seriesId)
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setModelId(m.id);
                    setCatId(null);
                  }}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    modelId === m.id
                      ? "bg-[#0071e3] text-white"
                      : "bg-white text-[#1d1d1f] shadow-sm hover:shadow-md"
                  }`}
                >
                  {m.model_name}
                </button>
              ))}
          </div>
        </section>
      )}

      {/* Step 3：比價 + 配件 */}
      {model && (
        <section ref={resultRef} className="max-w-5xl mx-auto px-6 pb-20 scroll-mt-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-5">
            <span className="text-[#0071e3]">3.</span> {model.model_name} 適用配件
          </h2>

          {/* 省多少 */}
          {savings.rows.length > 0 && (
            <div className="bg-[#1d1d1f] text-white rounded-3xl p-6 md:p-8 mb-8">
              <p className="text-sm text-gray-400 mb-1">Apple 原廠配件 vs eiP 配件</p>
              <p className="text-3xl md:text-4xl font-semibold tracking-tight">
                整套買齊，最多省 <span className="text-[#6fd0ff]">{NT(savings.total)}</span>
              </p>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                {savings.rows.map((r) => (
                  <div key={r.cat} className="bg-white/10 rounded-2xl px-4 py-3">
                    <div className="text-sm text-gray-300">{r.cat}</div>
                    <div className="text-sm mt-1">
                      原廠 {NT(r.appleMin)} 起 → eiP {NT(r.eipMin)} 起
                    </div>
                    <div className="font-semibold text-[#6fd0ff]">省 {NT(r.diff)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 分類頁籤 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {activeCats.map((c) => (
              <button
                key={c.id}
                onClick={() => setCatId(c.id)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  currentCat?.id === c.id
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-white shadow-sm hover:shadow-md"
                }`}
              >
                {c.name}（{compatProducts.filter((p) => p.category_id === c.id).length}）
              </button>
            ))}
          </div>

          {/* 產品卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {compatProducts
              .filter((p) => currentCat && p.category_id === currentCat.id)
              .map((p) => {
                const buy = p.website_link || p.original_link || p.shopee_link;
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="relative bg-[#fafafa]">
                      {p.ranking != null && (
                        <span className="absolute top-3 left-3 rounded-full bg-[#0071e3] text-white text-xs px-2.5 py-1 font-medium">
                          推薦
                        </span>
                      )}
                      {p.image_link && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_link} alt={p.name} className="w-full aspect-square object-contain p-4" />
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="font-medium leading-snug flex-1">{p.name}</div>
                      <div className="mt-2 text-lg font-semibold">{NT(p.price)}</div>
                      {buy && (
                        <a
                          href={buy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 rounded-full bg-[#0071e3] text-white text-center text-sm font-medium py-2.5 hover:bg-[#0077ed]"
                        >
                          前往購買
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      <footer className="text-center text-xs text-[#86868b] pb-10 px-6">
        價格以 eiP 官網為準。Apple、iPad 為 Apple Inc. 之商標，僅供型號對照參考。
      </footer>
    </div>
  );
}
