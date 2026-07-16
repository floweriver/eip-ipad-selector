# eiP 挑 iPad 產品推薦網頁

## 專案目標
把去年 GAS 版的「挑 iPad 配件推薦」工具，重寫成現代化網頁。

## 技術棧（比照樂萌 ERP）
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase / PostgreSQL（資料層，待建）
- 部署：GitHub → Vercel

## 重要決策記錄
- 走路線 C：資料搬 Supabase + 前端重寫，獨立專案但技術棧比照 ERP
- 相容性改乾淨的多對多關聯表，拿掉舊版的「!排除」與 group 字串語法
- 後台優先：先做產品/相容性維護介面，再做前台挑選流程

## 已知地雷
- 舊版一般版與 BTS 版大量複製貼上，新版務必合併成單一 codebase
