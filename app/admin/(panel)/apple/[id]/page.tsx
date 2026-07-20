// v1.0.0 | 2026-07-17 | Apple 品項編輯頁
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AppleForm from "../apple-form";
import { loadFormData } from "../../products/_data";

export default async function EditApplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = supabaseAdmin();

  const [{ data: item }, { data: compat }, formData] = await Promise.all([
    db.from("apple_products").select("id, name, category_id, price").eq("id", id).single(),
    db.from("apple_product_compatibility").select("model_id").eq("apple_product_id", id),
    loadFormData(),
  ]);

  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">編輯 Apple 品項</h1>
      <AppleForm
        mode="edit"
        item={item}
        categories={formData.categories}
        series={formData.series}
        groups={formData.groups}
        initialCompat={(compat ?? []).map((c) => c.model_id)}
      />
    </div>
  );
}
