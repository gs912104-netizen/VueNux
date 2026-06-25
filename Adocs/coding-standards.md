### 通用規則

- 所有程式碼使用繁體中文註解
- 命名一律使用 PascalCase（類別、方法）、camelCase（變數、參數）
- 禁止直接在應用層寫 SQL，一律透過 Stored Procedure
- 每個方法只做一件事，保持單一職責

### Frontend（jQuery + Bootstrap 5）

- 所有資料存取透過 AJAX 呼叫 MVC Controller
- 禁止在前端直接操作商業邏輯
- UI 呈現使用Razor View (.cshtml),統一使用 Bootstrap 5 規範（基底 Bootstrap 5.2 + AdminLTE 4，詳見 `frontend-style-guide.md`）
- AJAX 錯誤一律顯示統一的錯誤提示元件

### Web 層（ASP.NET Core MVC）

- Controller 只負責接收請求、驗證、轉發，禁止寫商業邏輯
- 統一回傳格式：

```json
  { "success": true, "data": {}, "message": "" }
```

- 所有對 Service 的呼叫透過 gRPC Client
- 使用 ActionFilter 統一處理例外

### Service 層（ASP.NET Core gRPC）

- 只負責業務流程協調，不直接操作 DB
- 透過 DLL（DAL）存取資料
- Proto 檔案統一放在 `Proto/` 資料夾
- 方法命名與 Proto 定義保持一致

### DAL（Class Library）

- 只允許呼叫 Stored Procedure，禁止直接下 SQL
- 使用 base.DB(底層元件,引用 Microsoft.Data.SqlClient) 作為資料存取工具，**不使用 Dapper**
- 連線字串從 `JepunConfig.json` 注入，禁止硬寫
- 參數一律用 `Hashtable htData`（不用強型別 model）；回傳 `IEnumerable<List<object>>` / `Dictionary<string, object>` 等弱型別集合，**禁止回傳 DataTable / dynamic**（詳見 `database-conventions.md`）

### 資料庫（MS SQL）

- 商業邏輯集中在 Stored Procedure
- SP 命名規則（標準格式）：查詢 `PR_[資料表]SelT[n]`、異動 `PR_[資料表]Mod[動作]`（`ModIns` / `ModUpd` / `ModDel`），例如 `PR_TdMasterParamSelT1`、`PR_TdMasterParamModIns`（詳見 `database-conventions.md`）
- 禁止在 SP 以外的地方處理商業運算
