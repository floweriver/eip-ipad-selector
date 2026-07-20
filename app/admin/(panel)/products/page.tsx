// v1.1.0 | 2026-07-20 | 產品列表：分類篩選 + 搜尋 + 相容台數 + 匯出/匯入 CSV
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CsvToolbar from "../io/csv-toolbar";

type Row = {
  id: string;
  name: string;
  price: number;
  ranking: number | null;
  categories: { name: string } | null;
  product_compatibility: { count: number }[];
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; saved?: string }>;
}) {
  const { cat, q, saved } = await searchParams;
  const db = supabaseAdmin();

  const { data: categories } = await db.from("categories").select("id, name").order("sort_order");

  let query = db
    .from("products")
    .select("id, name, price, ranking, categories(name), product_compatibility(count)")
    .order("name");
  if (cat) query = query.eq("category_id", cat);
  if (q) query = query.ilike("name", `%${q}%`);
  const { data: products, error } = await query.overrideTypes<Row[]>();

  if (error) {
    return <p className="text-red-600">讀取失敗：{error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">eiP 產品（{products?.length ?? 0}）</h1>
        <div className="flex items-start gap-2">
          <CsvToolbar table="products" />
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            ＋ 新增產品
          </Link>
        </div>
      </div>

      {saved && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">已儲存 ✓</p>
      )}

      <form className="flex gap-2 mb-4">
        <select name="cat" defaultValue={cat ?? ""} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
          <option value="">全部分類</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="搜尋產品名稱…"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm flex-1 max-w-xs bg-white"
        />
        <button className="rounded-lg bg-gray-800 text-white px-4 py-2 text-sm">篩選</button>
        {(cat || q) && (
          <Link href="/admin/products" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800">清除</Link>
        )}
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">產品名稱</th>
              <th className="px-4 py-3 font-medium w-24">分類</th>
              <th className="px-4 py-3 font-medium w-24 text-right">價格</th>
              <th className="px-4 py-3 font-medium w-20 text-center">推薦</th>
              <th className="px-4 py-3 font-medium w-24 text-center">相容台數</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.categories?.name}</td>
                <td className="px-4 py-3 text-right">{p.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  {p.ranking != null ? <span className="text-amber-500">★</span> : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">{p.product_compatibility?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:underline">編輯</Link>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">沒有符合的產品</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
