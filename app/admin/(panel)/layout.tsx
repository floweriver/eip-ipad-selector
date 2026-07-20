// v1.0.0 | 2026-07-17 | 後台版型：左側導覽 + 登出
import Link from "next/link";
import { logout } from "../login/actions";

export const metadata = { title: "後台管理 | eiP 挑 iPad" };
// 後台一律即時撈資料，不做靜態快照（否則 Vercel build 時會把當下資料凍結進頁面）
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin/products", label: "eiP 產品" },
  { href: "/admin/apple", label: "Apple 品項" },
  { href: "/admin/models", label: "iPad 型號" },
  { href: "/admin/groups", label: "相容群組" },
  { href: "/admin/sn", label: "A 碼對照" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-52 shrink-0 bg-gray-900 text-gray-100 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-700">
          <div className="font-bold">eiP 後台管理</div>
          <div className="text-xs text-gray-400 mt-1">挑 iPad 產品推薦</div>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 text-sm hover:bg-gray-800 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="p-4 border-t border-gray-700">
          <button className="w-full text-sm text-gray-300 hover:text-white text-left">登出</button>
        </form>
      </aside>
      <main className="flex-1 p-6 max-w-6xl">{children}</main>
    </div>
  );
}
