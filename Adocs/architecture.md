# 系統架構文件

## 架構總覽

本專案採用**四層式架構**，各層職責明確，透過介面隔離，實現高內聚低耦合。

```
┌─────────────────────────────────────────────┐
│           Browser（使用者端）                │
│         jQuery + Bootstrap 5                │
│     SPA 體驗，透過 AJAX 呼叫後端              │
│     UI呈現使用 Razor View (.cshtml)          │
└─────────────────┬───────────────────────────┘
                  │ AJAX (HTTP/JSON)
┌─────────────────▼───────────────────────────────────────────────────┐
│          Web 層                                                     │
│        ASP.NET Core MVC                                             │
│   API Gateway / BFF Layer，接收前端請求，驗證參數，轉發至 gRPC         │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ gRPC (HTTP/2 + Protobuf)
┌─────────────────▼───────────────────────────┐
│          Service 層（業務協調）              │
│        ASP.NET Core gRPC                    │
│   業務流程協調，呼叫 DAL 存取資料             │
└─────────────────┬───────────────────────────┘
                  │ DLL 引用（方法呼叫）
┌─────────────────▼───────────────────────────────────────────────────┐
│          DAL（資料存取層）                                           │
│    Class Library（base.DB[底層元件,引用 Microsoft.Data.SqlClient]）  │
│   只允許呼叫 Stored Procedure                                        │
└─────────────────┬───────────────────────────────────────────────────┘
                  │ ADO.NET 
┌─────────────────▼───────────────────────────┐
│          資料庫（MS SQL Server）             │
│   商業邏輯集中於 Stored Procedure            │
└─────────────────────────────────────────────┘
```

---

## 各層職責說明

### Frontend（jQuery + Bootstrap 5）

- **職責**：UI 呈現使用Razor View (.cshtml)、使用者互動、SPA 頁面切換
- **框架基底**：Bootstrap 5.2 + AdminLTE 4 後台模板（外觀/CSS 慣例見 `@docs/frontend-style-guide.md`）
- **通訊方式**：AJAX（HTTP GET / POST）
- **禁止**：直接呼叫 gRPC、直接操作資料庫、處理商業邏輯

### Web 層（ASP.NET Core MVC）

- **職責**：API Gateway / BFF Layer，接收前端請求並轉發至 gRPC Service
- **通訊方式**：接收 AJAX → 呼叫 gRPC Client
- **禁止**：寫商業邏輯、直接操作 DAL、直接查詢資料庫

### Service 層（ASP.NET Core gRPC）

- **職責**：業務流程協調，呼叫一個或多個 DAL `[模組]Service`（`Jepun.AM.Service`）完成業務
- **通訊方式**：被 MVC 以 gRPC 呼叫 → 呼叫 DAL DLL
- **禁止**：直接操作資料庫、包含 UI 邏輯

### DAL（Class Library / DLL）

- **職責**：資料存取，封裝所有 Stored Procedure 呼叫
- **通訊方式**：base.DB(底層元件,引用 Microsoft.Data.SqlClient) → MS SQL SP
- **禁止**：直接下 SQL、包含商業邏輯

### 資料庫（MS SQL Server）

- **職責**：資料儲存，商業邏輯集中於 Stored Procedure
- **禁止**：SP 以外的應用層直接操作資料

---

## 專案目錄結構

> 完整、權威的目錄結構與「方案實際組成」以 `CLAUDE.md` 的「檔案結構」章節與 `@docs/solution-guide.md` 第 1 節為準；本處只列架構導向的骨幹，方便對照各層位置。
> 注意：DAL（`Jepun.AM.Service`）**位於方案根目錄**，並非 `Service/` 子資料夾下；其介面資料夾為 `interface/`（`I[模組]Service.cs`，非 IRepository）。

```
solution/
├── CLAUDE.md                          ← AI 開發規範（主規範＋按需載入索引）
├── Jepun.AM.CDF.sln
├── docs/                              ← 參考文件（architecture / coding-standards /
│                                         database-conventions / grpc-contracts /
│                                         solution-guide / frontend-ui-guide /
│                                         frontend-style-guide / i18n-resource-guide / tech-debt）
├── Console/                           ← Tools（StandardBulkCopy、SftpDownLoadMoneyDJ、Common/Jepun.Console.Helper）
├── DB/
│   └── Jepun.AM.DB/                   ← MSSQL DB schema
│       ├── 0-Table/                   ← Tables（依模組分子目錄）
│       ├── 1-Trigger/  2-AlterTable/  3-FN/  4-View/  5-SP/  6-Ini/  Doc/
├── DevOps/                            ← 部署 / batch
├── Grpc/
│   └── Jepun.AM.Grpc/                 ← Service 層（ASP.NET Core gRPC）
│       └── Services/                  ← [模組]Grpc.cs
├── Jepun.AM.Service/                  ← DAL（Class Library / DLL，**在 root，非 Service/ 之下**）
│   ├── [模組]Service.cs
│   ├── interface/                     ← I[模組]Service.cs
│   ├── SqlMapping.cs  ApiMapping.cs
├── Proto/
│   └── Jepun.AM.Proto/                ← .proto 定義檔（common.proto、CommonBase/）
├── Resource/
│   └── Jepun.AM.Resource/             ← 多語系資源檔（Label / Err / Report / Tour）
├── Web/
│   ├── Jepun.AM.Web/                  ← Web 層（ASP.NET Core MVC，對外主站）
│   │   ├── AuthStrategy/              ← 登入策略（DB / LDAP / WindowsAD / Okta，見 solution-guide §4）
│   │   ├── Common/                    ← ServiceHelper、Bulkhead、Helper、EFlow
│   │   ├── Controllers/  Filter/  Models/  Views/
│   │   └── wwwroot/                   ← css / js（core + apps）/ lib
│   └── Jepun.AM.Oktatest.Web/         ← OKTA 登入驗證試驗站（隔離，勿混入主站）
├── WorkerService/
│   └── Jepun.Hosting.WorkerService/   ← 排程 / 背景任務（RabbitMQ 佇列消費）
└── openspec/                          ← 規格驅動變更流程（changes / specs / archive，見 CLAUDE.md「開發流程與工具」）
```

---

## 通訊協定規範

### AJAX（前端 ↔ MVC）

- 格式：JSON
- 統一回傳結構：

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### gRPC（MVC ↔ gRPC Service）

- 格式：Protobuf（HTTP/2）
- Proto 檔案位置：`Proto/Jepun.AM.Proto`
- 詳細合約定義見 [@docs/grpc-contracts.md](grpc-contracts.md)

---

## 相依關係圖

```
Web/Jepun.AM.Web
  └── gRPC Client 連線 Jepun.AM.Grpc

Grpc/Jepun.AM.Grpc
  └── 引用 Jepun.AM.Service（DAL，位於方案根目錄）

Jepun.AM.Service（DAL）
  └── 引用 Jepun.Service.Base（base.DB / BaseService）
  └── 使用 base.DB(底層元件,引用 Microsoft.Data.SqlClient)


```

---

## 部署架構

```
[IIS / Kestrel]
    ├── Jepun.AM.Web  → Port 5000（對外 HTTP）
    └── Jepun.AM.Grpc → Port 1028（內部 gRPC，不對外開放）

[MS SQL Server]
    └── 僅允許 Jepun.AM.Grpc 所在主機連線
```
