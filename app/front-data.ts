// v1.0.0 | 2026-07-20 | 前台資料載入（一般版與蝦皮版共用，單一資料來源）
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { FrontData } from "./home-client";

export async function loadFrontData(): Promise<FrontData> {
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

  return {
    series: series.data ?? [],
    models: models.data ?? [],
    categories: categories.data ?? [],
    products: products.data ?? [],
    compat: compat.data ?? [],
    apple: apple.data ?? [],
    appleCompat: appleCompat.data ?? [],
    sns: sns.data ?? [],
  };
}
