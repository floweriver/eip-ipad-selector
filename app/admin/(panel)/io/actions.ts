// v1.0.0 | 2026-07-20 | CSV 匯入 server action：id 有值=更新、空=新增；空格保留原值；不刪除；錯誤列擋下
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseCsv } from "@/lib/csv";

export type ImportReport = {
  created: number;
  updated: number;
  errors: { line: number; message: string }[];
};

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

function splitCompat(cell: string): string[] {
  return cell
    .split(/[、,|;\n]/)
    .map((s) => norm(s))
    .filter(Boolean);
}

function parseBool(cell: string): boolean | undefined {
  if (cell === "") return undefined; // 空=保留原值
  if (["是", "1", "true", "TRUE", "Y", "y"].includes(cell)) return true;
  if (["否", "0", "false", "FALSE", "N", "n"].includes(cell)) return false;
  return undefined;
}

export async function importCsv(table: string, csvText: string): Promise<ImportReport> {
  const db = supabaseAdmin();
  const rows = parseCsv(csvText);
  const report: ImportReport = { created: 0, updated: 0, errors: [] };
  if (rows.length === 0) {
    report.errors.push({ line: 0, message: "檔案沒有資料列（請確認第一列是欄名）" });
    return report;
  }

  // 共用對照表
  const [{ data: cats }, { data: series }, { data: groups }, { data: models }] = await Promise.all([
    db.from("categories").select("id, name"),
    db.from("ipad_series").select("id, name"),
    db.from("compat_groups").select("id, name"),
    db.from("ipad_models").select("id, model_name"),
  ]);
  const catId = new Map((cats ?? []).map((c) => [norm(c.name), c.id]));
  const seriesId = new Map((series ?? []).map((s) => [norm(s.name), s.id]));
  const groupId = new Map((groups ?? []).map((g) => [norm(g.name), g.id]));
  const modelId = new Map((models ?? []).map((m) => [norm(m.model_name), m.id]));

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const line = i + 2; // 含標題列的實際行號
    const id = (r["id"] ?? "").trim();
    const isUpdate = id !== "";

    try {
      if (table === "products") {
        const fields: Record<string, unknown> = {};
        if (r["產品名稱"]) fields.name = r["產品名稱"];
        if (r["分類"]) {
          const cid = catId.get(norm(r["分類"]));
          if (!cid) throw new Error(`分類「${r["分類"]}」不存在`);
          fields.category_id = cid;
        }
        if (r["推薦"] !== "") fields.ranking = parseBool(r["推薦"]) ? 1 : null;
        if (r["價格"]) {
          const p = Number(r["價格"]);
          if (!Number.isFinite(p) || p <= 0) throw new Error(`價格「${r["價格"]}」不是有效數字`);
          fields.price = Math.round(p);
        }
        if (r["EAN"]) fields.ean = r["EAN"];
        if (r["圖片連結"]) fields.image_link = r["圖片連結"];
        if (r["購買連結lihi"]) fields.website_link = r["購買連結lihi"];
        if (r["官網連結"]) fields.original_link = r["官網連結"];
        if (r["蝦皮連結"]) fields.shopee_link = r["蝦皮連結"];

        let compatIds: string[] | null = null;
        if (r["相容機型"]) {
          compatIds = splitCompat(r["相容機型"]).map((name) => {
            const mid = modelId.get(name);
            if (!mid) throw new Error(`相容機型「${name}」不存在（請照型號頁的名稱填）`);
            return mid;
          });
        }

        let pid = id;
        if (isUpdate) {
          const { data, error } = await db.from("products").update(fields).eq("id", id).select("id");
          if (error) throw new Error(error.message);
          if (!data || data.length === 0) throw new Error("找不到這個 id（是否貼錯？）");
          report.updated++;
        } else {
          if (!fields.name || !fields.category_id || !fields.price)
            throw new Error("新增列必須有：產品名稱、分類、價格");
          const { data, error } = await db.from("products").insert(fields).select("id").single();
          if (error) throw new Error(error.message);
          pid = data.id;
          report.created++;
        }
        if (compatIds) {
          await db.from("product_compatibility").delete().eq("product_id", pid);
          if (compatIds.length > 0) {
            const { error } = await db
              .from("product_compatibility")
              .insert(compatIds.map((m) => ({ product_id: pid, model_id: m })));
            if (error) throw new Error("相容寫入失敗：" + error.message);
          }
        }
      } else if (table === "apple") {
        const fields: Record<string, unknown> = {};
        if (r["品名"]) fields.name = r["品名"];
        if (r["分類"]) {
          const cid = catId.get(norm(r["分類"]));
          if (!cid) throw new Error(`分類「${r["分類"]}」不存在`);
          fields.category_id = cid;
        }
        if (r["價格"]) {
          const p = Number(r["價格"]);
          if (!Number.isFinite(p) || p <= 0) throw new Error(`價格「${r["價格"]}」不是有效數字`);
          fields.price = Math.round(p);
        }
        let compatIds: string[] | null = null;
        if (r["相容機型"]) {
          compatIds = splitCompat(r["相容機型"]).map((name) => {
            const mid = modelId.get(name);
            if (!mid) throw new Error(`相容機型「${name}」不存在`);
            return mid;
          });
        }
        let aid = id;
        if (isUpdate) {
          const { data, error } = await db.from("apple_products").update(fields).eq("id", id).select("id");
          if (error) throw new Error(error.message);
          if (!data || data.length === 0) throw new Error("找不到這個 id");
          report.updated++;
        } else {
          if (!fields.name || !fields.category_id || !fields.price)
            throw new Error("新增列必須有：品名、分類、價格");
          const { data, error } = await db.from("apple_products").insert(fields).select("id").single();
          if (error) throw new Error(error.message);
          aid = data.id;
          report.created++;
        }
        if (compatIds) {
          await db.from("apple_product_compatibility").delete().eq("apple_product_id", aid);
          if (compatIds.length > 0) {
            const { error } = await db
              .from("apple_product_compatibility")
              .insert(compatIds.map((m) => ({ apple_product_id: aid, model_id: m })));
            if (error) throw new Error("相容寫入失敗：" + error.message);
          }
        }
      } else if (table === "models") {
        const fields: Record<string, unknown> = {};
        if (r["型號名稱"]) fields.model_name = norm(r["型號名稱"]);
        if (r["系列"]) {
          const sid = seriesId.get(norm(r["系列"]));
          if (!sid) throw new Error(`系列「${r["系列"]}」不存在`);
          fields.series_id = sid;
        }
        if (r["群組"]) {
          const gid = groupId.get(norm(r["群組"]));
          if (!gid) throw new Error(`群組「${r["群組"]}」不存在`);
          fields.group_id = gid;
        }
        const act = parseBool(r["前台顯示"] ?? "");
        if (act !== undefined) fields.is_active = act;
        if (r["排序"]) fields.sort_order = Number(r["排序"]);

        if (isUpdate) {
          const { data, error } = await db.from("ipad_models").update(fields).eq("id", id).select("id");
          if (error) throw new Error(error.message);
          if (!data || data.length === 0) throw new Error("找不到這個 id");
          report.updated++;
        } else {
          if (!fields.model_name || !fields.series_id || !fields.group_id)
            throw new Error("新增列必須有：型號名稱、系列、群組");
          if (fields.is_active === undefined) fields.is_active = true;
          const { error } = await db.from("ipad_models").insert(fields);
          if (error) throw new Error(error.message);
          report.created++;
        }
      } else if (table === "groups") {
        const fields: Record<string, unknown> = {};
        if (r["群組名稱"]) fields.name = r["群組名稱"];
        if (r["舊代碼"]) fields.legacy_code = r["舊代碼"];
        if (r["排序"]) fields.sort_order = Number(r["排序"]);

        if (isUpdate) {
          const { data, error } = await db.from("compat_groups").update(fields).eq("id", id).select("id");
          if (error) throw new Error(error.message);
          if (!data || data.length === 0) throw new Error("找不到這個 id");
          report.updated++;
        } else {
          if (!fields.name) throw new Error("新增列必須有：群組名稱");
          const { error } = await db.from("compat_groups").insert(fields);
          if (error) throw new Error(error.message);
          report.created++;
        }
      } else if (table === "sn") {
        const fields: Record<string, unknown> = {};
        if (r["A碼"]) {
          const sn = r["A碼"].toUpperCase();
          if (!/^A\d{4}$/.test(sn)) throw new Error(`A 碼「${r["A碼"]}」格式錯誤（A + 4 位數字）`);
          fields.sn = sn;
        }
        if (r["型號"]) {
          const mid = modelId.get(norm(r["型號"]));
          if (!mid) throw new Error(`型號「${r["型號"]}」不存在`);
          fields.model_id = mid;
        }
        if (isUpdate) {
          const { data, error } = await db.from("sn_codes").update(fields).eq("id", id).select("id");
          if (error) throw new Error(error.message);
          if (!data || data.length === 0) throw new Error("找不到這個 id");
          report.updated++;
        } else {
          if (!fields.sn || !fields.model_id) throw new Error("新增列必須有：A碼、型號");
          const { error } = await db.from("sn_codes").insert(fields);
          if (error) throw new Error(error.message);
          report.created++;
        }
      } else {
        throw new Error("未知的列表");
      }
    } catch (e) {
      report.errors.push({ line, message: e instanceof Error ? e.message : String(e) });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/apple");
  revalidatePath("/admin/models");
  revalidatePath("/admin/groups");
  revalidatePath("/admin/sn");
  return report;
}
