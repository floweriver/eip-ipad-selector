// v1.0.0 | 2026-07-20 | 前台一頁式選機頁：伺服器端一次載入全部資料，互動交給 client 元件
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import HomeClient, { type FrontData } from "./home-client";

export const dynamic = "force-dynamic"; // 每次開頁都撈最新資料（後台改完立即反映）

export default async function HomePage() {
  const db = supabaseAdmin();

  const [series, models, categories, products, compat, apple, appleCompat, sns] =
    await Promise.all([
      db.from("ipad_series").select("id, name, image_url, sort_order").order("sort_order"),
      db
        .from("ipad_models")
        .select("id, series_id, model_name, sort_order")
        .eq("is_active", true)
        .order("sort_order"),
      db.from("categories").select("id, name, sort_order").order("sort_order"),
      db
        .from("products")
        .select("id, category_id, name, ranking, price, image_link, website_link, original_link, shopee_link"),
      db.from("product_compatibility").select("product_id, model_id"),
      db.from("apple_products").select("id, category_id, name, price"),
      db.from("apple_product_compatibility").select("apple_product_id, model_id"),
      db.from("sn_codes").select("sn, model_id"),
    ]);

  const data: FrontData = {
    series: series.data ?? [],
    models: models.data ?? [],
    categories: categories.data ?? [],
    products: products.data ?? [],
    compat: compat.data ?? [],
    apple: apple.data ?? [],
    appleCompat: appleCompat.data ?? [],
    sns: sns.data ?? [],
  };

  return <HomeClient data={data} />;
}
