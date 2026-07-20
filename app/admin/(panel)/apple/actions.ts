// v1.0.0 | 2026-07-17 | Apple 品項維護 server actions
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AppleInput = {
  id?: string;
  name: string;
  category_id: string;
  price: number;
  modelIds: string[];
};

export async function saveApple(input: AppleInput): Promise<{ error?: string }> {
  const db = supabaseAdmin();

  if (!input.name.trim()) return { error: "品名不可空白" };
  if (!input.category_id) return { error: "請選擇分類" };
  if (!Number.isFinite(input.price) || input.price <= 0) return { error: "價格必須是大於 0 的整數" };

  const fields = {
    name: input.name.trim(),
    category_id: input.category_id,
    price: Math.round(input.price),
  };

  let appleId = input.id;

  if (appleId) {
    const { error } = await db.from("apple_products").update(fields).eq("id", appleId);
    if (error) return { error: "儲存失敗：" + error.message };
  } else {
    const { data, error } = await db.from("apple_products").insert(fields).select("id").single();
    if (error) return { error: "新增失敗：" + error.message };
    appleId = data.id;
  }

  const { error: delErr } = await db.from("apple_product_compatibility").delete().eq("apple_product_id", appleId);
  if (delErr) return { error: "更新相容清單失敗：" + delErr.message };

  if (input.modelIds.length > 0) {
    const rows = input.modelIds.map((model_id) => ({ apple_product_id: appleId, model_id }));
    const { error: insErr } = await db.from("apple_product_compatibility").insert(rows);
    if (insErr) return { error: "寫入相容清單失敗：" + insErr.message };
  }

  revalidatePath("/admin/apple");
  redirect("/admin/apple?saved=1");
}

export async function deleteApple(formData: FormData) {
  const id = String(formData.get("id"));
  const db = supabaseAdmin();

  await db.from("apple_product_compatibility").delete().eq("apple_product_id", id);
  await db.from("apple_products").delete().eq("id", id);

  revalidatePath("/admin/apple");
  redirect("/admin/apple");
}
