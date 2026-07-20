// v1.0.0 | 2026-07-17 | A 碼對照維護 server actions
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function addSn(formData: FormData) {
  const db = supabaseAdmin();
  const sn = String(formData.get("sn") ?? "").trim().toUpperCase();
  const model_id = String(formData.get("model_id"));

  if (!/^A\d{4}$/.test(sn)) {
    redirect("/admin/sn?err=" + encodeURIComponent("A 碼格式應為 A + 4 位數字，例如 A2902"));
  }

  const { error } = await db.from("sn_codes").insert({ sn, model_id });
  revalidatePath("/admin/sn");
  redirect("/admin/sn" + (error ? "?err=" + encodeURIComponent(error.message) : "?saved=1"));
}

export async function updateSn(formData: FormData) {
  const db = supabaseAdmin();
  const id = String(formData.get("id"));
  const { error } = await db
    .from("sn_codes")
    .update({ model_id: String(formData.get("model_id")) })
    .eq("id", id);

  revalidatePath("/admin/sn");
  redirect("/admin/sn" + (error ? "?err=" + encodeURIComponent(error.message) : "?saved=1"));
}

export async function deleteSn(formData: FormData) {
  const db = supabaseAdmin();
  const id = String(formData.get("id"));
  await db.from("sn_codes").delete().eq("id", id);
  revalidatePath("/admin/sn");
  redirect("/admin/sn?saved=1");
}
