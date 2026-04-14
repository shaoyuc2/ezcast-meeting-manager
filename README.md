<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**語言 Language**：繁體中文 | [English](./README_EN.md)

# EZCast Meeting Manager

一套給展會（CES、Computex 等）現場團隊使用的會議預約 Dashboard。自動同步 Cal.com 上的預約，並支援團隊成員即時指派（由 Firebase Firestore 多裝置即時同步）。適合參展期間需要把大量客戶會議分配給不同 AM／BD／工程師的團隊。

## 功能特色

- 🗓️ **Cal.com 預約自動同步** — 透過 Cal.com v1 API 拉取所有預約，可依展會年份過濾
- 👥 **團隊成員指派** — 每一場會議（以來客 email 為單位展開）指派給負責的團隊成員
- ⚡ **Firestore 即時同步** — 成員清單與指派狀態透過 `onSnapshot` 跨裝置即時同步，現場多人同時操作不衝突
- 🕐 **時區 / 語系可設定** — 依展會所在地調整（例：CES → LA、Computex → 台北）
- 🎨 **按日期分組 + 時段色彩編碼** — 現場快速辨識

## 技術棧

- **前端**：React 19 + TypeScript + Vite 6
- **即時後端**：Firebase Firestore
- **外部 API**：Cal.com v1 (`/bookings`)
- **UI**：Tailwind（CDN）+ `lucide-react`

---

## 🧭 角色與職責（部署前必讀）

這套 Dashboard **需要跨部門協作**才能部署完成，因為：

> **Cal.com API Key 綁定帳號** — 金鑰只能讀取「該帳號底下」的預約資料。
> 所以**誰負責對外接預約，就必須由誰建立 Cal.com 帳號與 API Key**，再把 Key 交給 IT 部署。

| 角色 | 負責項目 |
|------|---------|
| **行銷團隊／業務團隊** | Cal.com 帳號、預約網址（Event Type）、可預約時段（Availability）、API Key 產出 |
| **IT 部門** | Firebase 專案、環境變數、部署、Firestore 安全規則 |

**重要：IT 不要自己用個人帳號去申請 Cal.com Key**，否則讀到的會是 IT 個人的預約，不是行銷對客戶開出的預約網址的預約。

---

## 📋 部署流程

### Part 1：行銷／業務團隊（Cal.com 端）

#### 1. 建立 Cal.com 帳號
前往 [https://cal.com](https://cal.com) 註冊（或用現有公司帳號）。建議用公司共用信箱，不要綁個人信箱。

#### 2. 建立預約網址（Event Type）
登入後 → **Event Types** → **Create** → 設定：
- 名稱（例：`CES 2026 Booth Meeting`、`Computex 2026 Demo`）
- 時長（15 / 30 / 60 分鐘）
- 地點（現場攤位、線上會議連結等）
- 發佈後會得到一個公開預約網址，例：`cal.com/your-company/ces-2026`

#### 3. 設定可預約時段（Availability）
**Availability** → 設定展期內每日可被預約的時段。
- 注意時區：通常設成展會所在地（CES: Pacific Time；Computex: Taipei Time）
- 記得把中午休息、團隊 sync 時段 block 起來

#### 4. 把預約網址發給客戶
透過 email、EDM、名片、LinkedIn 等管道散出去。客戶自己選時間，系統會自動寄確認信並存進 Cal.com。

#### 5. 產生 API 金鑰，交給 IT
前往 **設定 (Settings) → 開發人員 (Developer) → API 金鑰 (API Keys)**
👉 [https://app.cal.com/settings/developer/api-keys](https://app.cal.com/settings/developer/api-keys)

- 點 **+ Add** 建立新金鑰
- 命名（例：`EZCast Dashboard`）、**不設到期日**（或設在展會結束後一週）
- 複製產生的金鑰（格式：`cal_live_xxxxx...`）
- **⚠️ 金鑰只會顯示一次**，複製後以安全管道（密碼管理器、1Password、Bitwarden）交給 IT

---

### Part 2：IT 部門（部署端）

#### 前置需求
- Node.js 18+
- Firebase 帳號（Google 帳號即可）
- 從行銷收到的 Cal.com API Key

#### 1. 建立 Firebase 專案（一次性）
這個專案需要**你自己的** Firebase 專案，不會（也不應該）共用他人的後端。

1. 前往 [Firebase Console](https://console.firebase.google.com) → **新增專案**
2. 啟用 **Firestore Database**（建置 → Firestore Database → 建立資料庫）
3. （建議）啟用 **Authentication**：登入方法選 Email/Password 或 Google
   > ⚠️ **注意**：目前 app 尚未內建登入 UI。若套用 `firestore.rules` 的 Option A（`if request.auth != null;`），需先自行加上 Firebase Auth 登入畫面才能讀寫資料。若暫時不想實作，可改用更嚴格的做法（僅限本地 dev、不部署公網），**不要**改回 `if true;`。
4. 專案設定 → 一般設定 → 你的應用程式 → **網頁應用程式** → 複製 Firebase SDK 設定值
5. 套用安全規則：把 repo 裡的 `firestore.rules` 內容貼到 **Firestore → 規則** 分頁並發布

#### 2. Clone 與設定

```bash
git clone https://github.com/shaoyuc2/ezcast-meeting-manager.git
cd ezcast-meeting-manager
npm install
cp .env.example .env.local
```

編輯 `.env.local` 填入所有值：

```
# 從行銷收到的
VITE_CAL_API_KEY=cal_live_xxxxxxx...

# 從 Firebase Console 複製的
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...   # 可選，啟用 Google Analytics 才需要

# 展會設定
VITE_APP_EVENT_NAME=CES            # CES / Computex / IFA / MWC ...
VITE_APP_YEAR=2026
VITE_TIMEZONE=America/Los_Angeles  # 展會所在地時區
VITE_LOCALE=zh-TW                  # 顯示語系
```

#### 3. 執行

```bash
npm run dev       # http://localhost:3000
npm run build     # 打包到 dist/
npm run preview   # 預覽打包結果
```

#### 4. 部署（選擇你們習慣的）
- **Firebase Hosting**：`firebase init hosting && firebase deploy`
- **Vercel / Netlify**：連 GitHub repo 自動部署，環境變數加進平台後台
  > ⚠️ **注意**：這會讓 app 變成 public URL，**Cal.com API Key 會透過瀏覽器 network 請求外洩**（因為 v1 API 走 query string）。只有在「Vercel/Netlify 專案設為 Private、或用 password protection、或放 VPN 後」才建議這樣部署，否則請改用內網環境。
- **自建伺服器**：把 `dist/` 塞進 nginx 即可

---

## 專案結構

```
├── App.tsx                    # 主容器
├── components/
│   ├── Sidebar.tsx            # 左側導航（Bookings / Members）
│   ├── BookingCard.tsx        # 單一會議卡片 + 指派下拉
│   └── MemberManagement.tsx   # 成員新增／刪除
├── services/
│   ├── calService.ts          # Cal.com API 呼叫
│   ├── firebaseService.ts     # Firestore subscribe / mutate
│   └── syncService.ts
├── constants.ts               # 所有設定值（從 env 讀）
├── types.ts
├── firestore.rules            # Firestore 安全規則範本
└── .env.example               # 所有必填環境變數
```

## Firestore 資料結構

```
members/                         # collection
  └── {memberId}  { name: string }

assignments/                     # collection
  └── {bookingId}_{guestEmail}  { memberId: string }
```

指派 document ID 用 `bookingId_guestEmail` 組合，同一場會議多位 guest 可分別指派給不同人。

## 安全性注意事項

- **Firebase Web 設定是 public-safe** — bundle 裡暴露的 API Key 不是祕密，真正的存取控制靠 **Firestore Security Rules**。不要跳過 Part 2 的第 1.5 步。
- **Cal.com API Key 是真祕密** — 現行實作走 query string（Cal.com v1 慣例），請勿把 build 後的檔案直接放到 public CDN 或開源 fork，否則會在瀏覽器 network log 外洩。只在內部／私有環境部署。
- **Fork 這個專案要自己建自己的 Firebase 與 Cal.com 帳號**，不要沿用原作者的資源。

## 授權

MIT — 詳見 [LICENSE](./LICENSE)
