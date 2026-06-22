# 🚀 QtwWeb 金融商品前後端整合系統 (VueNuxtWeb)

本專案採用 **Nuxt 4 (Vue 3 SPA/SSR)** 與 **.NET 10 Web API** 進行雙端分離架構開發，並透過 **BFF (Backend-For-Frontend)** 設計模式確保企業級金融核心 API 的安全性。

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