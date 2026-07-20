// v1.0.0 | 2026-07-20 | 列表工具列：匯出 CSV 下載 + 匯入 CSV（選檔 → 上傳 → 顯示結果報告）
"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importCsv, type ImportReport } from "./actions";

export default function CsvToolbar({ table }: { table: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    startTransition(async () => {
      const result = await importCsv(table, text);
      setReport(result);
      router.refresh();
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <a
          href={`/admin/export/${table}`}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          匯出 CSV
        </a>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {pending ? "匯入中…" : "匯入 CSV"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {report && (
        <div className="mt-1 text-right">
          <p className="text-sm text-green-700">
            匯入完成：新增 {report.created} 筆、更新 {report.updated} 筆
            {report.errors.length > 0 && <span className="text-red-600">、失敗 {report.errors.length} 筆</span>}
            <button onClick={() => setReport(null)} className="ml-2 text-xs text-gray-400 hover:text-gray-600">
              關閉
            </button>
          </p>
          {report.errors.length > 0 && (
            <ul className="mt-1 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-left max-w-md max-h-40 overflow-auto">
              {report.errors.map((e, i) => (
                <li key={i}>第 {e.line} 行：{e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
