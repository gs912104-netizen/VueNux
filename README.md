# 🚀  (VueNuxtWeb)

本專案採用 **Nuxt 4 (Vue 3 SPA/SSR)** 與 **.NET 10 Web API** 進行雙端分離架構開發，並透過 **BFF (Backend-For-Frontend)** 設計模式確保 API 的安全性。

---

## 🏗️ 系統架構與安全設計 (BFF Pattern)

為了防止敏感 API 密鑰（如 JWT Token、ApiKey）在外網暴露，本系統不允許瀏覽器直連 .NET 10 後端。所有請求皆由 Nuxt 內建的 Node.js 伺服器進行安全代理：



```text
[瀏覽器前端 Vue 3] 
       │
       ▼ (同網域/相對路徑: /api/products/1001)
[Nuxt 4 Node.js BFF 代理層] 
       │
       ▼ (內部防火牆 / 附帶 Server 機密 Token)
[.NET 10 Web API 核心核心] ──► [MSSQL / 金融資料庫]
🛠️ 專案目錄結構
本專案整合於單一解決方案中，可使用 Visual Studio 2022 直接開啟：

Plaintext
VueNuxt/
├── VueNuxtWeb.slnx             # 新版 Visual Studio 方案設定檔
├── DotNet10Api/                # .NET 10 後端 Web API 專案 (.csproj)
│   ├── Controllers/            # API 控制器 (包含 ProductController)
│   └── Properties/             # 包含 launchSettings.json (啟動配置)
└── my-nuxt-app/                # Nuxt 4 前端專案 (.esproj)
    ├── app/                    # Nuxt 4 新版應用程式目錄
    │   ├── pages/              # 路由頁面 (如 products/[id].vue)
    │   └── app.vue             # 根組件
    └── server/                 # Nuxt 後端伺服器層 (BFF 路由代理)
💻 本地開發偵錯 (Local Development)
方案 A：最推薦 🌟 使用 Visual Studio 一鍵偵錯 (F5)
本專案已配置 .slnx 與 .esproj 聯動，不需要開啟多個命令提示字元（CMD）。

使用 Visual Studio 2022 (17.10+) 打開根目錄的 VueNuxtWeb.slnx。

確認上方啟動專案設定為 「多個啟動專案 (Multiple Startup Projects)」。

直接按下 F5：

系統會自動帶起 .NET 10 API 並開啟 Swagger 介面 (http://localhost:5000/swagger)。

自動背景執行前端 npm run dev 並開啟前端網頁 (http://localhost:3000)。

方案 B：手動分端啟動 (透過命令列)
1. 後端 .NET 10 API
確保已安裝 .NET 10 SDK，進入 DotNet10Api 目錄：

Bash
cd DotNet10Api

# 建議使用 watch 模式，支援代碼熱重載 (Hot Reload)
dotnet watch
2. 前端 Nuxt 4
進入 my-nuxt-app 目錄，安裝依賴並啟動：

Bash
cd my-nuxt-app

# 安裝套件
npm install

# 啟動開發伺服器 (http://localhost:3000)
npm run dev
📦 生產環境部署 (Production)
前端打包 (Nuxt Nitro)
在 my-nuxt-app 目錄下執行建置，專案會輸出標準 Node.js 服務或靜態檔案，可直接掛載於 IIS 或 Docker 容器中：

Bash
# 打包專案
npm run build

# 本地預覽生產環境編譯結果
npm run preview
後端發布 (.NET 10)
在 DotNet10Api 目錄下執行發布指令：

Bash
dotnet publish -c Release -o ./publish
💡 常用開發工具指令
清除 Nuxt 路由緩存： npx nuxi clean (當遭遇動態路由中括號解析卡住時使用)

快速新增前端頁面： npx nuxi add page "功能名稱/頁面"