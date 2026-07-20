// v1.0.0 | 2026-07-17 | Apple 品項列表
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Row = {
  id: string;
  name: string;
  price: number;
  categories: { name: string } | null;
  apple_product_compatibility: { count: number }[];
};

export default async function ApplePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const db = supabaseAdmin();

  const { data: items, error } = await db
    .from("apple_products")
    .select("id, name, price, categories(name), apple_product_compatibility(count)")
    .order("name")
    .overrideTypes<Row[]>();

  if (error) return <p className="text-red-600">讀取失敗：{error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Apple 品項（{items?.length ?? 0}）</h1>
        <Link href="/admin/apple/new" className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
          ＋ 新增品項
        </Link>
      </div>

      {saved && <p className="mb-4 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">已儲存 ✓</p>}

      <p className="mb-4 text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        比價功能靠這張表：客人選的型號若沒有任何 Apple 品項相容，該分類就算不出「省多少」。舊機型的原廠品項可以陸續在這裡補。
      </p>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">品名</th>
              <th className="px-4 py-3 font-medium w-24">分類</th>
              <th className="px-4 py-3 font-medium w-28 text-right">原廠價</th>
              <th className="px-4 py-3 font-medium w-24 text-center">相容台數</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items?.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{a.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.categories?.name}</td>
                <td className="px-4 py-3 text-right">{a.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">{a.apple_product_compatibility?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/apple/${a.id}`} className="text-blue-600 hover:underline">編輯</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
