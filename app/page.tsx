// v1.1.0 | 2026-07-20 | 前台一般版：資料載入抽到 front-data.ts 與蝦皮版共用
import { loadFrontData } from "./front-data";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic"; // 每次開頁都撈最新資料（後台改完立即反映）

export default async function HomePage() {
  const data = await loadFrontData();
  return <HomeClient data={data} linkMode="default" />;
}
