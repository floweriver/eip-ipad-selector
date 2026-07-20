# CLAUDE.md — eiP 挑 iPad 產品推薦網頁

> v2.1.0 | 2026-07-17 | 舊資料匯入完成；下一任務：後台維護介面

這份文件是給接手的 AI 助理（Claude Code）讀的。請先讀完整份，再開始任何工作。

---

## 一、專案是什麼

把 eiP 去年的「挑 iPad 配件推薦」工具（舊版是 Google Apps Script + Google Sheet）
重寫成現代化網頁。核心功能：
1. 客人選 iPad 系列 → 型號 → 看到相容的 eiP 配件（可依分類切換、有推薦徽章）
2. 「不知道型號」→ 輸入 A 碼查詢
3. **常駐比價**：同一台 iPad，Apple 原廠配件 vs eiP 配件，算出「選 eiP 省多少」

技術棧比照公司的樂萌 ERP：Next.js (App Router) + TypeScript + Tailwind + Supabase + Vercel。

---

## 二、開發規範（務必遵守，這是專案主的硬性要求）

**溝通對象**：專案主 Fred 對這套技術棧是新手（GAS 背景）。一律用**繁體中文**溝通、
把觀念講清楚、避免術語轟炸。**任何較大改動、動到既有 code 前，先說明「打算改什麼／為什麼／
風險／有無替代方案」，取得同意再動手**，不要自作主張。

**版次管理**：每個 code 檔開頭加版次標頭註解，格式 `vX.Y.Z | YYYY-MM-DD | 說明`。
patch=修 bug、minor=新功能、major=破壞性變更。

**程式碼慣例**：函式／變數／資料表欄位用**英文**；UI 顯示文字用**繁體中文**。
提供**完整可直接貼上的檔案**，而非片段 diff（除非是明確的小範圍修改才用 diff）。

**MD 文件格式**：標題/章節用繁中，內容精簡。每份功能 MD 需含這三區塊：
`### 重要決策記錄`（表格：決策｜原因｜排除的方案）、`### 已知地雷 ⚠️`、`### 當前狀態`（正在做／下一步）。

**Git commit 時機**：以下時刻提醒 Fred commit（格式 `vX.Y.Z | YYYY-MM-DD | 簡述`）：
方案確認後動工前、每次更新 MD 後、功能完成且測試正常後、對話快滿前。
方向錯了提醒他可 revert 回上一個 commit。

**MD 備份**：每次新增/更新 .md，提醒 Fred 存一份到 Google Drive「MD記錄」資料夾
（檔名帶時間戳、不覆蓋）。

---

## 三、目前進度（當前狀態）

**已完成**
- Next.js 專案骨架、可本機 `npm run dev`
- GitHub repo `eip-ipad-selector`（帳號 floweriver）、Vercel 自動部署（push 即上線）
- Supabase 專案（Fred 自己新開的，非公司 ERP；ref: `bqnyypygozzicjsqevrb`）9 張表建好
- **舊資料全數匯入完成（2026-07-17，總驗證 14 項全綠）**：
  12 群組 / 4 系列 / 30 型號 / 102 A碼 / 5 分類 / 43 產品 / 298 相容 / 8 Apple 品項 / 58 Apple 相容。
  RLS 全開、公開讀取政策齊全。細節與決策全記錄在 `docs/資料層.md`（v1.1.0）。

**下一步（＝你的首要任務）**：做**後台維護介面**（後台優先於前台）：
1. 產品 CRUD（列表、編輯價格/連結/推薦徽章）
2. 相容機型勾選介面 + 相容群組「一鍵套用」（套用後可再逐台增減）
3. 後台順手補齊舊機型的 Apple 原廠品項（目前只涵蓋新機，舊機比價不完整）
4. 後台完成後才做前台選機流程與比價頁

---

## 四、資料層

完整設計與匯入記錄見 `docs/資料層.md`（v1.1.0，已含實際筆數與所有匯入決策）。
9 張表：`compat_groups`、`ipad_series`、`categories`、`ipad_models`、`sn_codes`、
`products`、`product_compatibility`、`apple_products`、`apple_product_compatibility`。

**相容性核心原則（最重要，別搞錯）**：
- 舊版用「逗號字串 + `!` 排除 + group 展開」硬解相容性 —— **新版完全不要這套**（匯入時已全部展開成關聯列）。
- 相容性一律存成 `product_compatibility`（product ↔ model 一台一台記）的乾淨關聯列。
- `compat_groups`（相容群組，依機身尺寸分群、可跨系列）只是**上架時的「一鍵套用」輔助**：
  選群組 → 自動展開成該群所有型號寫入關聯表 → 可再手動增減單台。群組本身不承載相容性。

**匯入後的 schema 補充**：`products` 多了 `original_link` 欄位（官網原始連結；
`website_link` 放 lihi 短網址）。各表關鍵欄位已加唯一索引（詳見 `docs/資料層.md`）。

---

## 五、Supabase 連線

- 專案 URL：`https://bqnyypygozzicjsqevrb.supabase.co`
- `.env.local`（`NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`）。
- `service_role` 是機密：**只在 server 端（Route Handlers / Server Components）使用，
  絕不放進前端、絕不 commit 進 git**。`.env.local` 必須在 `.gitignore` 內。
- 前端唯讀走 anon key（public read 政策已設好）；寫入（後台維護）走 server 端 service role。
- ⚠️ **Claude 的 Supabase 連接器連的是公司 ERP 帳號（與海外同事共用 Claude 帳號），
  不可切換**。要動這個專案的資料庫：由 Claude 產 SQL → Fred 貼 Supabase SQL Editor 執行
  →把結果貼回給 Claude 驗證（匯入階段即以此模式完成）。後台做好後改走後台維護。

---

## 六、重要決策記錄

| 決策 | 原因 | 排除的方案 |
|------|------|-----------|
| 相容性存乾淨關聯表（product↔model） | 拿掉舊版字串/`!`排除，易錯難維護 | 沿用 group 字串 + `!` |
| 相容群組當「一鍵套用」helper | 上架快、資料仍乾淨、例外可調 | 純 product↔group（無法處理例外） |
| 型號比照 Apple 官方，尺寸寫進 model_name | 配件認尺寸，11/13 吋須分開 | 11/13 吋合併 |
| 比價功能常駐化（非 BTS 限定） | 「省多少」是最強銷售點 | 只在 BTS 期間顯示 |
| price 存 int | 舊版字串/數字混用致計算錯 | 沿用 text |
| 不做 bts_options / bns_activities | BTS 限定、活動性質 | 照搬舊 BTS 版 |
| 後台優先於前台 | 資料乾淨了前台才好寫 | 先做前台 |
| 同名多列照列匯入（43 筆產品） | 各尺寸規格有獨立價格與購買連結 | 同名合併（丟失價差與連結） |
| products 加 `original_link` 欄位 | 短網址與官網連結並存 | 只留一種連結 |
| 資料庫操作走 SQL Editor 手動貼 | 連接器與同事共用不可切換 | 重接連接器／邀請成員 |

（匯入層級的細部決策——群組正名、封存不匯、Pencil 補齊等——見 `docs/資料層.md`。）

---

## 七、已知地雷 ⚠️

- 舊 codeTable 的 group_name 命名地雷**已於匯入時正名**（`Group_ipadairproold` → mini 6、
  `Group_iPad69` → iPad 6・mini 5），舊代碼存於 `legacy_code` 備查。
- 舊版「一般版」與「BTS 版」曾大量複製貼上 → 新版務必**單一 codebase**，用參數切換，勿分兩套。
- 相容性務必存在**型號層級**；群組只是輸入輔助，勿把相容性直接綁在群組上。
- `service_role` key 絕不進前端、絕不進 git。
- Claude 的 Supabase 連接器**不可切換帳號**（同事共用），見第五節。
- 匯入時人工修正/補充過的資料（後台檢查時留意）：小平包 11吋排除清單修正、
  快捷版 Air13 補 Pro 12.9、Apple Pencil 系列相容補齊 —— 完整清單見 `docs/資料層.md` 地雷區。
- 「封存」工作表的舊品未匯入；舊 Excel（iPad Product Map.xlsx）是資料備援，勿丟。
- Fred 是新手：大改動前先討論、用繁中解釋、給完整可貼上的檔案。
