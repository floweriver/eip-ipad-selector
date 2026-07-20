// v1.0.0 | 2026-07-17 | 新增 Apple 品項頁
import AppleForm from "../apple-form";
import { loadFormData } from "../../products/_data";

export default async function NewApplePage() {
  const formData = await loadFormData();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">新增 Apple 品項</h1>
      <AppleForm
        mode="new"
        item={{ name: "", category_id: "", price: null }}
        categories={formData.categories}
        series={formData.series}
        groups={formData.groups}
        initialCompat={[]}
      />
    </div>
  );
}
