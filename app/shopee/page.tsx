// v1.0.0 | 2026-07-20 | 前台蝦皮版（/shopee）：與一般版共用畫面，購買按鈕一律開蝦皮連結
import { loadFrontData } from "../front-data";
import HomeClient from "../home-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "eiP 挑 iPad 配件（蝦皮版）｜找到最適合你 iPad 的配件",
};

export default async function ShopeePage() {
  const data = await loadFrontData();
  return <HomeClient data={data} linkMode="shopee" />;
}
