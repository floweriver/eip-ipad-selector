// v1.0.0 | 2026-07-17 | /admin 首頁：導向產品列表
import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/admin/products");
}
