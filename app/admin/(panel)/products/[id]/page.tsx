// v1.0.0 | 2026-07-17 | 產品編輯頁
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ProductForm from "../product-form";
import { loadFormData } from "../_data";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = supabaseAdmin();

  const [{ data: product }, { data: compat }, formData] = await Promise.all([
    db
      .from("products")
      .select("id, name, category_id, ranking, price, ean, image_link, website_link, shopee_link, original_link")
      .eq("id", id)
      .single(),
    db.from("product_compatibility").select("model_id").eq("product_id", id),
    loadFormData(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">編輯產品</h1>
      <ProductForm
        mode="edit"
        product={product}
        categories={formData.categories}
        series={formData.series}
        groups={formData.groups}
        initialCompat={(compat ?? []).map((c) => c.model_id)}
      />
    </div>
  );
}
