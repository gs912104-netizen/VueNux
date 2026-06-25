# 方案開發指引（Jepun.AM.CDF）

> 本文件對齊 `Jepun.AM.CDF.sln` **實際內容**，補齊 `CLAUDE.md` 與其他 `docs/*.md` 未涵蓋的部分（多策略登入、外部框架相依、WorkerService 佇列、Console 工具、部署）。
> 既有規範請續以下列文件為準，本文件不重複：
> - `@docs/architecture.md`、`@docs/coding-standards.md`、`@docs/database-conventions.md`、`@docs/grpc-contracts.md`

---

## 1. 方案實際組成（依 `.sln`）

`.sln` 以「Solution Folder」分組，實際可建置專案如下：

| Solution Folder | 專案 / 內容 | TargetFramework | 角色 |
| --------------- | ----------- | --------------- | ---- |
| **Web** | `Web/Jepun.AM.Web` | net8.0（`Microsoft.NET.Sdk.Web`） | MVC（BFF）— 對外主站 |
| **Web** | `Web/Jepun.AM.Oktatest.Web` | net8.0 | **OKTA 登入驗證測試站**（隔離試驗 OIDC，勿混入主站） |
| **GRpc** | `Grpc/Jepun.AM.Grpc` | net8.0（`Microsoft.NET.Sdk.Web`） | gRPC Service — 業務流程協調 |
| **Service** | `Jepun.AM.Service` | net8.0（`Microsoft.NET.Sdk`） | DAL（Class Library / DLL） |
| **Proto** | `Proto/Jepun.AM.Proto` | net8.0 | 共享 `.proto`（Web/Grpc 共用，含 Server+Client） |
| **Resource** | `Resource/Jepun.AM.Resource` | net8.0 | 多語系資源（現有 zh-TW + en-US 兩套 resx；km-KH 已於 Filter 支援但**尚無資源檔**，詳見 `@docs/i18n-resource-guide.md`） |
| **WorkerService** | `WorkerService/Jepun.Hosting.WorkerService` | net8.0（`Microsoft.NET.Sdk.Worker`） | 背景服務 / 佇列消費 |
| **Console** | `Console/StandardBulkCopy` | — | 資料大量匯入工具 |
| **Console** | `Console/SftpDownLoadMoneyDJ` | — | 從 MoneyDJ SFTP 下載行情/資料 |
| **Console / Common** | `Console/Common/Jepun.Console.Helper` | — | Console 共用函式庫 |
| **DB** | `DB/Jepun.AM.DB`（Website 專案，非 .NET 編譯） | — | MSSQL schema 原始檔（版控用） |
| **DevOps / 0.DocBat** | `DevOps/0.DocBat/JP_DB.Doc.bat` | — | DB 文件產生批次 |
| **Solution Items** | `.editorconfig` | — | 編碼風格 |

> **與既有 docs 的落差（請注意）**：
> - `architecture.md` 的目錄樹未含 `Jepun.AM.Oktatest.Web`、`Console/*`、`WorkerService`、`AuthStrategy/`，以本表為準。
> - DAL 回傳型別：原 `coding-standards.md`「回傳強型別 Model」與 `architecture.md`「引用 MyProject.Models」已對齊為實際慣例 —— **`Hashtable htData` 入參 + `IEnumerable<List<object>>` / `Dictionary<string, object>` 回傳、禁止 DataTable / dynamic**（規則 7：衝突挑較新、測試較完善者）。完整慣例見 `CLAUDE.md` / `database-conventions.md`。

---

## 2. 外部框架相依（不在本 repo 內）

本方案**強相依**一套外部框架，位於方案根目錄上層 `..\..\Framework\Net8.0\`（相對 `.sln` 為 `..\..\..\Framework`）。建置前必須先取得該框架，否則無法編譯。

### 2.1 ProjectReference（原始碼專案）

| 參照 | 路徑 | 由誰引用 |
| ---- | ---- | -------- |
| `Jepun.Service.Base` | `Framework\Net8.0\Jepun.Core\Jepun.Service.Base` | `Jepun.AM.Service`、`Jepun.AM.Grpc` |
| `Jepun.Web.Base` | `Framework\Net8.0\Jepun.Core\Jepun.Web.Base` | `Jepun.AM.Web` |

- DAL 的 `base.DB`、`BaseService` 來自 `Jepun.Service.Base`。
- Web 的 `BaseWebController` 等來自 `Jepun.Web.Base`。

### 2.2 DLL Reference（編譯後二進位，`Framework\Net8.0\Dlls\net8.0\`）

`Jepun.Core.Common`、`Jepun.Core.Data`、`Jepun.Core.Grpc`、`Jepun.Core.Log`、`Jepun.Core.Mail`、`Jepun.Core.Misc`、`Jepun.Core.Pdf`、`Jepun.Core.Web`、`JepunCustomer`

> 程式中常見的 `JepunConfig`、`NLogger`、`CmdProcess`、`ToHashtable()`、`ToDictionaryObj()`、`ObjToJson()` / `JsonToObj()`、`Result<T,string>` 等皆來自上述 DLL。**新增程式時優先重用框架既有工具，勿自行造輪子**（規則 2、規則 8）。

---

## 3. 完整模組對應矩陣（Proto ↔ Grpc ↔ DAL ↔ Controller）

四層命名一致，逐一對齊（已比對實檔）：

| 模組 | Proto | Grpc Service | DAL Service | DAL Interface | Web Controller 目錄 |
| ---- | ----- | ------------ | ----------- | ------------- | ------------------- |
| ApiCaller | ✅ | ✅ | ✅ | ✅ | （無，後端用） |
| App | ✅ | ✅ | ✅ | ✅ | `Controllers/App/` |
| Bgt | ✅ | ✅ | ✅ | ✅ | `Controllers/Bgt/` |
| Bnd | ✅ | ✅ | ✅ | ✅ | `Controllers/Bnd/` |
| Clt | ✅ | ✅ | ✅ | ✅ | `Controllers/Clt/` |
| Cmn | ✅ | ✅ | ✅ | ✅ | `Controllers/Cmn/` |
| Cus | ✅ | ✅ | ✅ | ✅ | （無，後端用） |
| DailyStartEnd | ✅ | ✅ | ✅ | ✅ | `Controllers/DailyStartEnd/` |
| DashDoard | ✅ | ✅ | ✅ | ✅ | （無，後端用） |
| FN | ✅ | ✅ | ✅ | ✅ | （無，後端用） |
| Fdf | ✅ | ✅ | ✅ | ✅ | `Controllers/EFlow/`（FDF=簽核映射） |
| Fnd | ✅ | ✅ | ✅ | ✅ | `Controllers/Fnd/` |
| Mds | ✅ | ✅ | ✅ | ✅ | `Controllers/Mds/` |
| Module | ✅ | ✅ | ✅ | ✅ | `Controllers/Module/` |
| Rpt | ✅ | ✅ | ✅ | ✅ | `Controllers/Rpt/` |
| Stk | ✅ | ✅ | ✅ | ✅ | `Controllers/Stk/` |
| Td | ✅ | ✅ | ✅ | ✅ | `Controllers/Td/` |
| Trs | ✅ | ✅ | ✅ | ✅ | `Controllers/Trs/` |
| **WorkerQueue** | ❌ | ❌ | ✅ `WorkerQueueService.cs` | ❌ | （無，供 Worker / 內部呼叫） |

- **共用 Controller**：`AccountController`（登入/登出）、`HomeController`、`CommonController`、`CultureSettingController`（語系切換）。
- `WorkerQueueService` **無對應 Proto / Grpc / interface**——它不是對外 RPC 模組，屬佇列寫入工具；新增功能時勿替它硬補 Proto。

> 新增一個模組方法時，連動清單（規則 8、`grpc-contracts.md`）：
> `5-SP/[模組]/PR_xxx.sql` → `SqlMapping.cs` → `[模組]Service.cs` + `interface/I[模組]Service.cs` → `[模組].proto` → `[模組]Grpc.cs` → `Common/Bulkhead/GrpcBulkhead.cs` → `Common/ServiceHelper.cs`（`IServiceHelper`）→ `Controllers/[模組]/xxxController.cs` → `wwwroot/js/apps/xxx.js`。

---

## 4. 登入驗證架構（策略模式，docs 未涵蓋）

主站 `Jepun.AM.Web` 支援**多種登入來源**，以策略模式封裝於 `Web/Jepun.AM.Web/AuthStrategy/`，由 `JepunConfig.json` 的 `SignOn` 設定決定採用哪一種。

### 4.1 介面與實作

`AuthStrategy/Interface/IAuthStrategy.cs`：

```csharp
public interface IAuthStrategy
{
    // DB / LDAP：手動帳密驗證（AccountController 呼叫）
    Task<bool>    ValidateCredentialsAsync(string id, string password);
    // AD / Okta：從 HTTP 環境取出已登入身分（Filter 呼叫），無則回 null
    Task<string?> GetIdentityAsync(HttpContext context);
    // OAuth2 / OIDC / SAML：發起外部驗證挑戰
    Task          ChallengeAsync(HttpContext context, string redirectUri);
}
```

| 實作 | 檔案 | 適用情境 |
| ---- | ---- | -------- |
| 資料庫帳密 | `DbAuthStrategy.cs` | 手動輸入帳密，比對 DB |
| LDAP | `LdapAuthStrategy.cs` | 企業 LDAP 帳密 |
| Windows AD | `WindowsAdStrategy.cs` | 整合式 Windows 驗證（環境身分） |
| Okta（OIDC） | `OktaAuthStrategy.cs` | 外部 OIDC 挑戰 / 回呼 |

### 4.2 與 Filter 的搭配

- `Filter/WindowsAuthorizeFilterAttribute.cs`：AD / 環境身分 → 走 `GetIdentityAsync`
- `Filter/OKTAAuthorizeFilterAttribute.cs`：Okta → 走 `ChallengeAsync` / `GetIdentityAsync`
- `Filter/CultureFilterAttribute.cs`：語系套用

> Controller 以 `[WindowsAuthorizeFilter]` / `[OKTAAuthorizeFilter]` 宣告所需驗證模式（見 `grpc-contracts.md` 範例）。**新增 Controller 時務必掛上對應 Filter，勿留未保護端點**（規則 12）。
> `Jepun.AM.Oktatest.Web` 為 OKTA 試驗站，**驗證流程定案後才合併回主站**（對應近期 commit「OKTA 合併回原專案」）；勿在主站直接做實驗性改動。

---

## 5. WorkerService（佇列驅動，docs 未涵蓋）

`WorkerService/Jepun.Hosting.WorkerService` 是 `BackgroundService`（`Worker.cs`），可註冊為 **Windows Service**（`Microsoft.Extensions.Hosting.WindowsServices`，`installation/` 內含安裝腳本）。

- 啟動時讀 `JepunConfig.Args["ServiceName"]`，於 `StartAsync` 呼叫 `cmdRun()` 透過 `CmdProcess` 啟動子行程；`StopAsync` / `Dispose` 以 `CmdProcess.Kill(_workerId)` 收掉。
- 佇列：`Jepun.AM.Web` 透過 **RabbitMQ**（`RabbitMQ.Client`，`JepunConfig.json` 的 `RabbitMQ` / `WorkerQueueName` / `PublishToQueue`）送出工作；資料寫入由 `WorkerQueueService`（DAL）負責。
- 記錄：`NLog` → `Jepun.Core.Log`。

> 排程/背景任務一律走此服務，**勿在 MVC 或 gRPC 內開長時間工作或自起執行緒**。

---

## 6. 設定檔（`JepunConfig.json`，各專案各一份）

Web / Grpc / WorkerService **各自持有** `JepunConfig.json`（`CopyToOutputDirectory=Always`）。連線字串、gRPC 位址、登入模式皆由此注入，**禁止硬寫**（核心規則 3）。

Web 端主要區段（鍵名節錄，**勿提交實際機密值**）：

| 區段 | 用途 |
| ---- | ---- |
| `AppInfo` | 系統基本資訊 |
| `SignOn` | 登入模式（對應第 4 節策略）、`Secret` |
| `CultureInfo` / `CustomerDllName` | 語系 / 客製 DLL（`JepunCustomer.dll`） |
| `ConnectionStrings`（`DEFAULT` / `PR_LOG` / `RabbitMQ`） | DB 連線、Log DB、MQ；含 `X509FileName`（連線憑證） |
| `Mail` | SMTP/POP 寄送設定 |
| `Args`（`CorsWebSite`、`ServerKey`、`ServerPort`、`ServerPfxFileName`、`ServerPfxPwd`、`WorkerQueueName`、`PublishToQueue`、`PollyRetryCount`、`AutoLogOut`、`CookieSecure`、`CookieExpires` …） | gRPC 連線位址/憑證、MQ、Polly 重試、Cookie/逾時 |
| `ApiConnectionStrings`（`RS` …） | 外部 API（ApiCaller 模組用） |

- gRPC 連線位址取自 `JepunConfig.json`（**非** `appsettings.json`），由 `getGrpcAccess()` 建立 Channel（見 `grpc-contracts.md`）。
- 機密憑證（`.pfx`）與密碼僅放佈署環境，**不入版控**。

---

## 7. 記錄與可觀測性

- 全方案統一 **NLog**（`NLog.config` 在 Web / Grpc / WorkerService，`CopyToOutputDirectory=Always`）。
- 透過框架 `Jepun.Core.Log`（`NLogger`）寫入。
- 支援 **Seq**（`NLog.Targets.Seq`）集中檢視。
- 例外處理沿用 `CLAUDE.md` 規範：**禁止 swallow**；gRPC 業務錯誤走 `StringObj.Err` 不 throw（`grpc-contracts.md`）。

---

## 8. 前端建置鏈（Web）

- 套件管理：`libman.json`（第三方前端庫 → `wwwroot/lib/`）、`package.json` + `Gruntfile.js`（建置任務）。
- TypeScript：`Microsoft.TypeScript.MSBuild`（`TypeScriptCompileBlocked=true`，建置不自動編譯 TS）。
- 共用 JS：`wwwroot/js/core/`（`jepun.*.js`）；頁面 JS：`wwwroot/js/apps/`（檔名對應 View）。
- 報表 / 匯出：`MiniExcel`（Excel）、`SkiaSharp` / `SixLabors.ImageSharp` / `Microsoft.Playwright`（PDF/圖像，`PdfOptimize/`、`Template/`、`fonts/`）。

---

## 9. 建置 / 執行 / 部署

### 9.1 前置

1. 取得外部框架 `..\..\Framework\Net8.0\`（第 2 節），否則無法 restore/build。
2. 各專案 `JepunConfig.json` 補上本機連線字串與 gRPC 位址。
3. MSSQL：依 `DB/Jepun.AM.DB/` 內 `0-Table` → `3-FN` → `4-View` → `5-SP` → `6-Ini` 順序建置 `JEPUN_AM_CDF`。

### 9.2 建置

```bash
dotnet restore Jepun.AM.CDF.sln
dotnet build   Jepun.AM.CDF.sln -c Debug
```

> `DB/Jepun.AM.DB`（Website 專案）與 Console 工具非主流程，主站只需 Web / Grpc / Service / Proto / Resource / WorkerService。

### 9.3 本機執行順序

1. 先起 **Grpc**（內部服務，預設 1028）：`dotnet run --project Grpc/Jepun.AM.Grpc`
2. 再起 **Web**（對外，預設 5000）：`dotnet run --project Web/Jepun.AM.Web`
3. 需背景任務時起 **WorkerService**。

### 9.4 容器化

- `Web` 與 `Grpc` 皆含 `Dockerfile`（`DockerDefaultTargetOS=Linux`）；`Web` 另有 `docker-compose.yml`。
- `Grpc` 的 `DockerfileContext=..\..`（以方案根為 build context，因需帶入外部框架）。

---

## 10. 新功能落地清單（Checklist）

對照 `CLAUDE.md` 規則 4「目標導向」與 `grpc-contracts.md` 連動表，完成一個查詢/異動功能：

```
1. SP        DB/Jepun.AM.DB/5-SP/[模組]/PR_[Table]SelT[n] | ModIns/Upd/Del  → 驗證：SSMS 可執行
2. DAL       SqlMapping.cs 常數 + [模組]Service.cs（Hashtable 入參）+ interface  → 驗證：編譯通過
3. Proto     [模組].proto 加 RPC（common.DictionaryObj → common.StringObj）   → 驗證：產生 Client/Server
4. Grpc      [模組]Grpc.cs override（ToHashtable → DAL → ObjToJson 包 StringObj）→ 驗證：錯誤走 Err 不 throw
5. Client    GrpcBulkhead.[Method]Async + ServiceHelper（IServiceHelper）       → 驗證：回傳 Result<T,string>
6. Web       Controllers/[模組]/xxxController（驗證參數 → ServiceHelper → 回傳） → 驗證：掛對應 Auth Filter
7. View/JS   Views/[頁面]/xxx.cshtml + wwwroot/js/apps/xxx.js（AJAX）            → 驗證：統一回傳格式解析
```

每個重大步驟後設檢查點（規則 10）；不確定是否成功要敗得大聲（規則 12）。
