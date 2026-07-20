// v1.0.0 | 2026-07-20 | 後台列表匯出 CSV：/admin/export/{products|apple|models|groups|sn}
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const db = supabaseAdmin();

  let csv: string | null = null;
  let filename = table;

  if (table === "products") {
    const [{ data: rows }, { data: cats }, { data: models }, { data: compat }] = await Promise.all([
      db.from("products").select("*").order("name"),
      db.from("categories").select("id, name"),
      db.from("ipad_models").select("id, model_name"),
      db.from("product_compatibility").select("product_id, model_id"),
    ]);
    const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));
    const modelName = new Map((models ?? []).map((m) => [m.id, m.model_name]));
    const compatByProduct = new Map<string, string[]>();
    (compat ?? []).forEach((c) => {
      const list = compatByProduct.get(c.product_id) ?? [];
      const n = modelName.get(c.model_id);
      if (n) list.push(n);
      compatByProduct.set(c.product_id, list);
    });
    csv = toCsv(
      ["id", "產品名稱", "分類", "推薦", "價格", "EAN", "圖片連結", "購買連結lihi", "官網連結", "蝦皮連結", "相容機型"],
      (rows ?? []).map((p) => [
        p.id, p.name, catName.get(p.category_id) ?? "", p.ranking != null ? 1 : "", p.price,
        p.ean, p.image_link, p.website_link, p.original_link, p.shopee_link,
        (compatByProduct.get(p.id) ?? []).join("、"),
      ])
    );
    filename = "eiP產品";
  }

  if (table === "apple") {
    const [{ data: rows }, { data: cats }, { data: models }, { data: compat }] = await Promise.all([
      db.from("apple_products").select("*").order("name"),
      db.from("categories").select("id, name"),
      db.from("ipad_models").select("id, model_name"),
      db.from("apple_product_compatibility").select("apple_product_id, model_id"),
    ]);
    const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));
    const modelName = new Map((models ?? []).map((m) => [m.id, m.model_name]));
    const byItem = new Map<string, string[]>();
    (compat ?? []).forEach((c) => {
      const list = byItem.get(c.apple_product_id) ?? [];
      const n = modelName.get(c.model_id);
      if (n) list.push(n);
      byItem.set(c.apple_product_id, list);
    });
    csv = toCsv(
      ["id", "品名", "分類", "價格", "相容機型"],
      (rows ?? []).map((a) => [
        a.id, a.name, catName.get(a.category_id) ?? "", a.price, (byItem.get(a.id) ?? []).join("、"),
      ])
    );
    filename = "Apple品項";
  }

  if (table === "models") {
    const [{ data: rows }, { data: series }, { data: groups }] = await Promise.all([
      db.from("ipad_models").select("*").order("sort_order"),
      db.from("ipad_series").select("id, name"),
      db.from("compat_groups").select("id, name"),
    ]);
    const sName = new Map((series ?? []).map((s) => [s.id, s.name]));
    const gName = new Map((groups ?? []).map((g) => [g.id, g.name]));
    csv = toCsv(
      ["id", "型號名稱", "系列", "群組", "前台顯示", "排序"],
      (rows ?? []).map((m) => [
        m.id, m.model_name, sName.get(m.series_id) ?? "", gName.get(m.group_id) ?? "",
        m.is_active ? "是" : "否", m.sort_order,
      ])
    );
    filename = "iPad型號";
  }

  if (table === "groups") {
    const { data: rows } = await db.from("compat_groups").select("*").order("sort_order");
    csv = toCsv(
      ["id", "群組名稱", "舊代碼", "排序"],
      (rows ?? []).map((g) => [g.id, g.name, g.legacy_code, g.sort_order])
    );
    filename = "相容群組";
  }

  if (table === "sn") {
    const [{ data: rows }, { data: models }] = await Promise.all([
      db.from("sn_codes").select("*").order("sn"),
      db.from("ipad_models").select("id, model_name"),
    ]);
    const modelName = new Map((models ?? []).map((m) => [m.id, m.model_name]));
    csv = toCsv(
      ["id", "A碼", "型號"],
      (rows ?? []).map((s) => [s.id, s.sn, modelName.get(s.model_id) ?? ""])
    );
    filename = "A碼對照";
  }

  if (csv == null) {
    return NextResponse.json({ error: "未知的列表" }, { status: 404 });
  }

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${filename}_${date}.csv`)}`,
    },
  });
}
