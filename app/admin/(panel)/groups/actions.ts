// v1.0.0 | 2026-07-17 | 相容群組維護 server actions
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function updateGroup(formData: FormData) {
  const db = supabaseAdmin();
  const id = String(formData.get("id"));

  const { error } = await db
    .from("compat_groups")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      sort_order: Number(formData.get("sort_order") ?? 0),
    })
    .eq("id", id);

  revalidatePath("/admin/groups");
  redirect("/admin/groups" + (error ? "?err=" + encodeURIComponent(error.message) : "?saved=1"));
}

export async function addGroup(formData: FormData) {
  const db = supabaseAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/groups?err=" + encodeURIComponent("群組名稱不可空白"));

  const { error } = await db.from("compat_groups").insert({
    name,
    legacy_code: String(formData.get("legacy_code") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 99),
  });

  revalidatePath("/admin/groups");
  redirect("/admin/groups" + (error ? "?err=" + encodeURIComponent(error.message) : "?saved=1"));
}

export async function deleteGroup(formData: FormData) {
  const db = supabaseAdmin();
  const id = String(formData.get("id"));

  const { count } = await db
    .from("ipad_models")
    .select("*", { count: "exact", head: true })
    .eq("group_id", id);
  if ((count ?? 0) > 0) {
    redirect("/admin/groups?err=" + encodeURIComponent(`還有 ${count} 台型號屬於這個群組，請先把型號改到其他群組`));
  }

  const { error } = await db.from("compat_groups").delete().eq("id", id);
  revalidatePath("/admin/groups");
  redirect("/admin/groups" + (error ? "?err=" + encodeURIComponent(error.message) : "?saved=1"));
}
