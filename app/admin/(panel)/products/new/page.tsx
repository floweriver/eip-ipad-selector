// v1.0.0 | 2026-07-17 | 新增產品頁
import ProductForm from "../product-form";
import { loadFormData } from "../_data";

export default async function NewProductPage() {
  const formData = await loadFormData();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">新增產品</h1>
      <ProductForm
        mode="new"
        product={{
          name: "",
          category_id: "",
          ranking: null,
          price: null,
          ean: null,
          image_link: null,
          website_link: null,
          shopee_link: null,
          original_link: null,
        }}
        categories={formData.categories}
        series={formData.series}
        groups={formData.groups}
        initialCompat={[]}
      />
    </div>
  );
}
