// v1.0.0 | 2026-07-17 | 後台登入頁
import { login } from "./actions";

export const metadata = { title: "後台登入 | eiP 挑 iPad" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">eiP 後台管理</h1>
        <p className="text-sm text-gray-500 mb-6">請輸入後台密碼</p>

        {err === "wrong" && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">密碼不正確，請再試一次。</p>
        )}
        {err === "noenv" && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            尚未設定 ADMIN_PASSWORD 環境變數，請先在 .env.local 設定後重啟。
          </p>
        )}

        <form action={login} className="space-y-4">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="後台密碼"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 transition"
          >
            登入
          </button>
        </form>
      </div>
    </main>
  );
}
