// v1.0.0 | 2026-07-17 | iPad 型號維護 server actions
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function updateModel(formData: FormData) {
  const db = supabaseAdmin();
  const id = String(formData.get("id"));

  const { error } = await db
    .from("ipad_models")
    .update({
      model_name: String(formData.get("model_name") ?? "").trim(),
      group_id: String(formData.get("group_id")),
      is_active: formData.get("is_active") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0),
    })
    .eq("id", id);

  revalidatePath("/admin/models");
  redirect("/admin/models" + (error ? "?err=" + encodeURIComponent(error.message) : "?saved=1"));
}

export async function addModel(formData: FormData) {
  const db = supabaseAdmin();
  const model_name = String(formData.get("model_name") ?? "").trim();
  if (!model_name) redirect("/admin/models?err=" + encodeURIComponent("型號名稱不可空白"));

  const { error } = await db.from("ipad_models").insert({
    model_name,
    series_id: String(formData.get("series_id")),
    group_id: String(formData.get("group_id")),
    is_active: true,
    sort_order: Number(formData.get("sort_order") ?? 99),
  });

  revalidatePath("/admin/models");
  redirect("/admin/models" + (error ? "?err=" + encodeURIComponent(error.message) : "?saved=1"));
}

export async function deleteModel(formData: FormData) {
  const db = supabaseAdmin();
  const id = String(formData.get("id"));

  // 有關聯資料就擋下，避免誤刪
  const [{ count: pc }, { count: ac }, { count: sc }] = await Promise.all([
    db.from("product_compatibility").select("*", { count: "exact", head: true }).eq("model_id", id),
    db.from("apple_product_compatibility").select("*", { count: "exact", head: true }).eq("model_id", id),
    db.from("sn_codes").select("*", { count: "exact", head: true }).eq("model_id", id),
  ]);
  const total = (pc ?? 0) + (ac ?? 0) + (sc ?? 0);
  if (total > 0) {
    redirect(
      "/admin/models?err=" +
        encodeURIComponent(`這台還有 ${total} 筆關聯資料（相容/A碼），請先清除關聯再刪除`)
    );
  }

  const { error } = await db.from("ipad_models").delete().eq("id", id);
  revalidatePath("/admin/models");
  redirect("/admin/models" + (error ? "?err=" + encodeURIComponent(error.message) : "?saved=1"));
}
