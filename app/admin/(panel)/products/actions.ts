// v1.0.0 | 2026-07-17 | 產品維護 server actions：儲存（含相容機型整批覆寫）、刪除
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ProductInput = {
  id?: string;
  name: string;
  category_id: string;
  ranking: number | null;
  price: number;
  ean: string | null;
  image_link: string | null;
  website_link: string | null;
  shopee_link: string | null;
  original_link: string | null;
  modelIds: string[];
};

export async function saveProduct(input: ProductInput): Promise<{ error?: string }> {
  const db = supabaseAdmin();

  if (!input.name.trim()) return { error: "產品名稱不可空白" };
  if (!input.category_id) return { error: "請選擇分類" };
  if (!Number.isFinite(input.price) || input.price <= 0) return { error: "價格必須是大於 0 的整數" };

  const fields = {
    name: input.name.trim(),
    category_id: input.category_id,
    ranking: input.ranking,
    price: Math.round(input.price),
    ean: input.ean?.trim() || null,
    image_link: input.image_link?.trim() || null,
    website_link: input.website_link?.trim() || null,
    shopee_link: input.shopee_link?.trim() || null,
    original_link: input.original_link?.trim() || null,
  };

  let productId = input.id;

  if (productId) {
    const { error } = await db.from("products").update(fields).eq("id", productId);
    if (error) return { error: "儲存失敗：" + error.message };
  } else {
    const { data, error } = await db.from("products").insert(fields).select("id").single();
    if (error) return { error: "新增失敗：" + error.message };
    productId = data.id;
  }

  // 相容機型：整批覆寫（先刪後插，跟勾選畫面完全一致）
  const { error: delErr } = await db.from("product_compatibility").delete().eq("product_id", productId);
  if (delErr) return { error: "更新相容清單失敗：" + delErr.message };

  if (input.modelIds.length > 0) {
    const rows = input.modelIds.map((model_id) => ({ product_id: productId, model_id }));
    const { error: insErr } = await db.from("product_compatibility").insert(rows);
    if (insErr) return { error: "寫入相容清單失敗：" + insErr.message };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products?saved=1");
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id"));
  const db = supabaseAdmin();

  await db.from("product_compatibility").delete().eq("product_id", id);
  await db.from("products").delete().eq("id", id);

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
