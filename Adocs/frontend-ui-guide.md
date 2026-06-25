# 前端三檔式主從頁開發設計指引（以 定存辦理 TdTrade 為範例）

> 本文件規範本專案「**主檔頁 + 總覽頁 + 編輯頁**」三檔式主從頁的標準寫法，適用所有需要「清單查詢 → 單筆檢視/新增/修改/刪除」的功能頁（TdTrade、TdMasterParam、TdInterest、BndTrade… 皆為同一模式）。
> 上層規範以 `@docs/grpc-contracts.md`（MVC↔gRPC）、`@docs/architecture.md`、`CLAUDE.md` 為準；本文件只補「前端 UI 三檔分工 + jepun.*.js 框架慣例」。

---

## 1. 三檔式架構總覽

一個功能頁固定拆成 **三組（Controller + View + JS）**，職責分明、檔名一一對應：

| 角色                                | Controller                    | View                                   | JS                          | 職責                                                                             |
| ----------------------------------- | ----------------------------- | -------------------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| **主檔頁（Master / Shell）**  | `TdTradeController`         | `Views/TdTrade/Index.cshtml`         | `apps/TdTrade.js`         | 外殼與導覽協調：頁籤切換、麵包屑、按鈕群組、共享狀態 `Args`、歷史紀錄、Sidebar |
| **總覽頁（Overview / List）** | `TdTradeOverviewController` | `Views/TdTradeOverview/Index.cshtml` | `apps/TdTradeOverview.js` | 篩選查詢、DataTable 清單、分頁、勾選、送簽（EFlow）                              |
| **編輯頁（Editor / Form）**   | `TdTradeEditorController`   | `Views/TdTradeEditor/Index.cshtml`   | `apps/TdTradeEditor.js`   | 單筆檢視/新增/修改/刪除/鎖定、欄位連動計算、附件模組                             |

**核心關係**：主檔頁是外殼，內含兩個頁籤容器（`#AppTab_TdTradeOverview`、`#AppTab_TdTradeEditor`），總覽頁與編輯頁是被**動態載入**到頁籤容器內的 Partial View。三者透過 **jepun 事件匯流排（fireHandler / addHandler）** 互相溝通，**不直接呼叫彼此的函式**。

```
┌──────────────── TdTrade（主檔頁 / Shell）────────────────┐
│  Header：按鈕群組(Overview/Editor)  +  Sidebar(頁籤)       │
│  共享狀態 Args{ Code, EditMode, Lock, Type, Pno, OriginNo }│
│  ┌─ #AppTab_TdTradeOverview ─┐  ┌─ #AppTab_TdTradeEditor ─┐│
│  │  TdTradeOverview（清單）   │  │  TdTradeEditor（表單）  ││
│  │  loadPartialViewPart 載入  │  │  loadPartialViewPart 載入││
│  └───────────────────────────┘  └─────────────────────────┘│
└────────────────────────────────────────────────────────────┘
       ▲ fireHandler({type:'GoStep'/'SetCode'/'SetMode'...})
       │ 子頁透過 mainView 觸發主檔頁事件來導覽 / 改狀態
```

---

## 2. 命名與對應規則（務必一致）

> `[資源]` 一律取自資料表名稱（`DB/Jepun.AM.DB/0-Table/[模組]/[資源].sql`，去 `.sql`），Controller / View / JS / Action 等皆以此為基準延伸。

| 項目              | 規則                                                                                                                | 範例                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Controller 類別   | `[資源][角色]Controller`（`[資源]` = 對應的資料表名稱，須與 `DB/Jepun.AM.DB/0-Table/[模組]/[資源].sql` 一致） | 對應資料表 `TdTrade.sql` → `TdTradeOverviewController`、`TdTradeEditorController`；主檔頁無角色後綴 `TdTradeController` |
| View 資料夾       | 與 Controller 同名（去 `Controller`）                                                                             | `Views/TdTradeOverview/Index.cshtml`                                                                                           |
| JS 檔             | 與 View 同名                                                                                                        | `wwwroot/js/apps/TdTradeOverview.js`                                                                                           |
| Form `jepun-id` | `Form` + Controller 名                                                                                            | `FormTdTradeOverview`、`FormTdTradeEditor`                                                                                   |
| 頁籤容器 id       | `AppTab_` + Overview/Editor Controller 名                                                                         | `#AppTab_TdTradeOverview`                                                                                                      |
| 查詢 Action       | `Get[資源]T[n]`（對齊 SP `SelT[n]` 與 proto `Get…T[n]`）                                                     | `GetTdTradeT1`（清單）、`GetTdTradeT2`（單筆）、`GetTdTradeT3`（下拉）                                                     |
| 異動 Action       | `Set[資源][Ins/Upd/Del/UpdLock]`（對齊 proto）                                                                    | `SetTdTradeIns`、`SetTdTradeUpdLock`                                                                                         |

> 連動鏈見 `@docs/solution-guide.md` 第 10 節 Checklist；前端這三檔是該鏈的最後一段（步驟 6、7）。

---

## 3. Controller 規範

通則（全部遵守 `CLAUDE.md`：Controller 只做「接收 → 驗證 → 呼叫 ServiceHelper → 回傳」，**禁止商業邏輯**）：

- 一律 `[WindowsAuthorizeFilter]`（或視模組改 `[OKTAAuthorizeFilter]`），繼承 `BaseWebController`，建構子傳入 Controller 名字串。
- 子頁（Overview/Editor）以建構子注入 `IServiceHelper`，**不直接持有 gRPC Client**。
- 資料回傳給前端的標準手法：`FormFireHandler("事件名", innerArgs)` + `return JQuery.ToString()`；資料以 `ObjToJson()` 放進 `innerArgs`。
- 服務呼叫一律 `var retVal = await _serviceHelper.XxxAsync(...)`，回傳 `Result<T,string>`；失敗時 `BootstrapAlert(...) ` 後 `return`，**不可吞例外**。

### 3.1 主檔頁 Controller（外殼，最精簡）

```csharp
[WindowsAuthorizeFilter]
public class TdTradeController : BaseWebController
{
    public TdTradeController() : base("TdTradeController") { }

    [BreadcrumbActionFilter]                 // 只有主檔頁掛麵包屑
    public IActionResult Index() => View("Index");

    public string Ini()                      // 頁面初始化事件
    {
        Dictionary<string, string> innerArgs = new() { };
        FormFireHandler("Ini", innerArgs);
        return JQuery.ToString();
    }
}
```

> 主檔頁**不注入 ServiceHelper、不做查詢**；只負責 `Index` 與 `Ini`。

### 3.2 總覽頁 Controller（清單查詢）

```csharp
public IActionResult Index() => View();      // Layout=null 的 Partial

public string Ini()
{
    Dictionary<string, string> innerArgs = new();
    innerArgs.Add("IsAdmin", ((base.GetClaim("Role") == "admin") + "").ToUpper()); // 權限旗標下放前端
    FormFireHandler("Ini", innerArgs);
    return JQuery.ToString();
}

public async Task<string> GetTdTradeT1(TdTradeOverviewViewModel model)
{
    Dictionary<string, string> innerArgs = new();
    model.Type = "1";
    var retVal = await _serviceHelper.GetTdTradeT1Async(model).ConfigureAwait(false);
    if (!retVal.IsOk)
    {
        BootstrapAlert(Label.Error, ResourceAdapter.GetResourceString(typeof(Err), retVal.GetErr), "danger");
        return JQuery.ToString();
    }
    innerArgs.Add("data", retVal.GetOk.ObjToJson());
    innerArgs.Add("page", model?.page + "");
    FormFireHandler("GetTdTradeT1", innerArgs);
    return JQuery.ToString();
}
```

### 3.3 編輯頁 Controller（單筆 + CRUD + 計算）

固定包含：

- `GetTdTradeT2`：取單筆（回傳 `innerArgs["obj"]`）。
- `GetTdTradeT3`：下拉清單，**直接回傳 `IEnumerable<List<object>>`**（非 FireHandler），並處理「請選擇」插入邏輯。
- 計算類 `Get…Calc`：`GetTdInterestReceivableCalc`、`GetCltMasterYearNavRateCalc`（呼叫 SP 算利息/淨值，結果回 `obj`）。
- 異動類 `SetTdTradeIns/Upd/Del/UpdLock`：**先 `ModelState.IsValid` 檢核** → 呼叫服務 → 成功 `BootstrapAlert(Label.Message, …)` 並回傳 `RowNo`。

```csharp
public async Task<string> SetTdTradeIns(TdTradeEditorViewModel model)
{
    Dictionary<string, string> innerArgs = new();
    if (!ModelState.IsValid)                                  // ① MVC 驗證
    {
        BootstrapAlert(Label.Error, ModelState.GetMvcErrMsgs().JoinCollection(), "danger");
        return JQuery.ToString();
    }
    var retVal = await _serviceHelper.SetTdTradeInsAsync(model.GetEntityHashtable()).ConfigureAwait(false);
    if (!retVal.IsOk)                                         // ② 服務層錯誤
    {
        BootstrapAlert(Label.Error, ResourceAdapter.GetResourceString(typeof(Err), retVal.GetErr), "danger");
        return JQuery.ToString();
    }
    innerArgs.Add("RowNo", retVal.GetOk);                     // ③ 回新 PK
    BootstrapAlert(Label.Message, Label.BaseInsSucces);
    FormFireHandler("SetTdTradeIns", innerArgs);
    return JQuery.ToString();
}
```

下拉清單寫法（含「請選擇」）：

```csharp
public async Task<IEnumerable<List<object>>> GetTdTradeT3(string pno, bool showPleaseSelect)
{
    var retVal = await _serviceHelper.GetTdTradeT3Async(new Hashtable() { { "Pno", pno } }).ConfigureAwait(false);
    if (!retVal.IsOk)
    {
        BootstrapAlert(Label.Error, ResourceAdapter.GetResourceString(typeof(Err), retVal.GetErr), "danger");
        return [];
    }
    List<List<object>> value = [.. retVal.GetOk];
    if (showPleaseSelect) { /* 無資料補表頭+空列；有資料於第 2 列插入空白 */ }
    return value;
}
```

---

## 4. ViewModel 規範與驗證機制

### 4.1 一個 Attribute、前後端兩層檢核（核心觀念）

本專案的驗證屬性多繼承 `ValidationAttribute` 並實作 **`IClientModelValidator`**（位於 `Framework\Net8.0\Jepun.Core\Jepun.Web.Base\Validation`）。一個屬性同時負責：

```
ViewModel 屬性  ─┬─► 伺服端：Controller `ModelState.IsValid`（GetMvcErrMsgs 取訊息）
（如 [SelectItem]）│
                 └─► 用戶端：標籤輔助器把規則寫成 data-val-* 屬性
                            → wwwroot/js/core/jepun.valid.js 的 unobtrusive adapter
                            → form.valid() 即時檢核
```

> **鐵則**：驗證規則寫在 **ViewModel 屬性**，不要在 JS 或 SP 重覆寫一份；前端的 `jepun.valid.js` 只是把同一條規則「就地呈現」。新增自訂規則時，C# 屬性與 `jepun.valid.js` 的 adapter 名稱必須**成對存在**。adapter 一律以**小寫** rule 名註冊（`adapters.add("xxx", …)`）；瀏覽器會把 `data-val-*` 屬性名正規化為小寫，所以框架即使在 `MergeAttribute` 寫成大小寫混用（如 `data-val-MathFormula`），實際仍對應小寫 adapter `mathformula`。
>
> ⚠ **已知缺口**：`DateMoreThen` 有 C# 屬性（送出 `data-val-DateMoreThen`），但 `jepun.valid.js` **無對應 adapter**，故其前端檢核不會觸發（僅伺服端生效）；新增屬性時務必同步補上 adapter，見 §4.3。

### 4.2 基本慣例

- 入參 ViewModel 命名 `[資源][角色]ViewModel`；異動類用 `model.GetEntityHashtable()` 轉 `Hashtable` 給服務層（對齊 DAL「Hashtable 入參」慣例）。
- **總覽頁 ViewModel 繼承 `PaginationModel`**（取得 `start/length/page`）。
- 每個字串欄位掛 `[RegularExpression(RegularPattern.XSS, …)]` 防 XSS（**必加**）。
- 錯誤訊息一律走資源檔：`ErrorMessageResourceName="Key", ErrorMessageResourceType=typeof(Err)`，**禁止硬寫中文字串**。
- 樂觀鎖欄位 `LogSN`、狀態欄位（`Lock`、`Post`）一併放在 Editor ViewModel，由前端帶回。
- **`disabled` 的欄位用戶端自動跳過檢核**（如 `selectitem`）。對應 TdTrade 編輯頁：`Type=4(續作)` 時 `disable` `Cur`/`Bno`，其 `[SelectItem]` 不會誤擋送出（見 §7 狀態機）。

### 4.3 可用驗證屬性總表（`Jepun.Web.Base.Validation`）

> 建構式即用法；`data-val` 規則名為 `jepun.valid.js` 對應的 adapter。挑「最語意化」的屬性，不要用 `RegularExpression` 硬湊。

| 屬性（建構式）                                                            | 用戶端規則            | 用途                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[SelectItem(emptyVal = "")]`                                           | selectitem            | 下拉/複選必選（值≠emptyVal，慣例 `[SelectItem("-1")]`）；整合 select2 的 `select2:select/unselect`                                                                                                                                                        |
| `[ToFormat(kind = "", n = "0")]`                                        | toformat              | 數值/字串格式化+檢核。`kind`：`,.`(千分位+小數)、`.`、`,`、`num`、`%`、`xss`、`yyyy/mm/dd`、`yyyy-mm-dd`、`A/a/full`(全半形)；`n`=小數位                                                                                                 |
| `[NumberRange(min, max)]`（int / double / `(Type,string,string)`）    | numberrange           | 數值區間（繼承 `RangeAttribute`），如月數 0~240、天數 0~31                                                                                                                                                                                                  |
| `[DateRange(min, max)]`                                                 | daterange             | 日期相對區間（天數位移）                                                                                                                                                                                                                                       |
| `[DateFormat]`（含 `format`）                                         | dateformat            | 日期格式（`YYYY/MM/DD`、`YYYY-MM`…），culture 自動帶入                                                                                                                                                                                                    |
| `[DateTimeFormat]`                                                      | datetimeformat        | 日期時間格式（跨瀏覽器解析一致性）                                                                                                                                                                                                                             |
| `[DateCompare(smallVal, largeVal, allowEmpty=false, allowEqual=false)]` | datecompare           | 兩日期欄位比較（起日 ≤ 迄日），如交易日 vs 到期日                                                                                                                                                                                                             |
| `[DateMoreThen(days, op)]`                                              | datemorethen          | 與基準相差天數比較（`op` 指定 `>`/`<`…）。**⚠ `jepun.valid.js` 目前無此 adapter → 前端不檢核，僅伺服端生效**                                                                                                                                                                                                                |
| `[ChkRule(actionName, controlName = "Common")]`                         | chkrule               | 客製化檢核：前端內建 case 或**回後端 Action 取錯誤訊息**。TdTrade 用 `[ChkRule("GetTdMasterParamT3","Common")]` 檢核(交易商,幣別,日期)是否已建定存利息參數                                                                                             |
| `[ChkNeed(chkName, chkValue)]`                                          | chkneed               | 當 `chkName` 勾選 `chkValue` 時，本欄位必填                                                                                                                                                                                                                |
| `[RequireGroup(groupName, minimum, maximum)]`                           | requiregroup          | 同群組已輸入欄位數須介於 min~max                                                                                                                                                                                                                               |
| `[RequireDepend(groupName)]`                                            | requiredepend         | 群組相依：全有或全無                                                                                                                                                                                                                                           |
| `[RequireDependWith(groupName)]`（含 `isMain`）                       | requiredependwith     | 依主控項決定群組是否必填                                                                                                                                                                                                                                       |
| `[NotEqualTo(groupName)]`                                               | notequalto            | 群組內欄位值不可重複                                                                                                                                                                                                                                           |
| `[CheckBoxSelect(mininum = 1)]`                                         | checkboxselect        | checkbox/radio 至少選 n 個                                                                                                                                                                                                                                     |
| `[BooleanRequired]`                                                     | booleanrequired       | 單一 checkbox 必勾（同意條款類）                                                                                                                                                                                                                               |
| `[ValChgGroup(groupName)]`（含 `mask`）                               | valchggroup           | 群組內容至少一項有變更才通過                                                                                                                                                                                                                                   |
| `[DisplayNeed(displayItems)]`                                           | displayneed           | 依本欄位值，反向顯示/隱藏關聯欄位並清空其值（`1=Col3,2=Col4:Col5`）                                                                                                                                                                                          |
| `[IdCard(maxLen = 0, taxIdLen = 0)]`                                    | idcard                | 身分證/統編檢核；culture/env 自動帶入，`AppInfo=TEST` 環境跳過                                                                                                                                                                                               |
| `[EmailFormat]`                                                         | emailformat           | Email 格式                                                                                                                                                                                                                                                     |
| `[PhoneNumber(groupName)]`                                              | phonenumber           | 電話號碼                                                                                                                                                                                                                                                       |
| `[PhoneAreaCode]`                                                       | phoneareacode         | 區碼                                                                                                                                                                                                                                                           |
| `[PhoneMask(maxLen = 16)]`（含 `pattern`）                            | phonemask             | 電話遮罩格式（長度+樣式）                                                                                                                                                                                                                                      |
| `[AgeRange(min, max)]`                                                  | agerange              | 年齡區間                                                                                                                                                                                                                                                       |
| `[AgeNeed(mininum, needfield)]`                                         | ageneed               | 年齡 < 下限時，`needfield` 必填（未成年需監護人）                                                                                                                                                                                                            |
| `[MathFormula(formula = "", formulakind = "", formulapoint = "0")]`     | **mathformula** | 依公式自動計算/檢核欄位值（前端 `ClacMath`）。為真實 server 端 `ValidationAttribute`，但 `IsValid` 一律回 `Success`（實際計算在前端）；adapter 為小寫 `mathformula`（C# 在 `MergeAttribute` 寫成 `data-val-MathFormula`，經瀏覽器正規化為小寫後對上），帶 `-formula`/`-formulakind`/`-formulapoint` 三參數 |

> 另：標準 .NET DataAnnotations（`[Required]`、`[RegularExpression]`、`[DataType]`、`[DisplayFormat]`、`[StringLength]`）照常可用且優先用於最基本情境。
>
> **adapter 集合 ⊋ C# 屬性集合**：`jepun.valid.js` 除上表對應的 adapter 外，另含一批**純前端 / 行為型** adapter，在 `Jepun.Web.Base.Validation` 並無對應 C# 屬性（如 `displaygroup`、`chkneedgroup`、`chkneed2`、`valmappingchk`、`valmappingenable`、`valmappingdisable`、`Button`、`openiframeuse`）。這些由前端直接掛 `data-val-*` 或程式碼觸發，非由 ViewModel 屬性產生；上表只收錄「C# 屬性 ↔ adapter」成對者。

### 4.4 ViewModel 範例（取自 TdTrade 實檔）

```csharp
public class TdTradeOverviewViewModel : PaginationModel    // 取得 start/length/page
{
    [RegularExpression(RegularPattern.XSS, ErrorMessageResourceName="XSS", ErrorMessageResourceType=typeof(Err))]
    public string? Pno { get; set; }
    [DisplayFormat(DataFormatString="{0:yyyy-MM-dd}")]
    [RegularExpression(RegularPattern.XSS, …)] public string? Date { get; set; }
}

public class TdTradeEditorViewModel
{
    public int? RowNo { get; set; }

    [SelectItem("-1", ErrorMessageResourceName="MustRequired", ErrorMessageResourceType=typeof(Err))]   // 下拉必選
    [RegularExpression(RegularPattern.XSS, …)] public string? Pno { get; set; }

    [Required(ErrorMessageResourceName="MustRequired", …)]
    [DisplayFormat(DataFormatString="{0:yyyy-MM-dd}")]
    [RegularExpression(RegularPattern.XSS, …)] public string? Date { get; set; }

    [SelectItem("-1", …)]
    [ChkRule("GetTdMasterParamT3", "Common")]                                       // 交易商/幣別/日期 連動檢核
    [RegularExpression(RegularPattern.XSS, …)] public string? Cur { get; set; }

    [Required(…)]
    [RegularExpression(RegularPattern.Decimal_19_5, ErrorMessageResourceName="DecimalErr_19_5", …)]
    [ToFormat(",.", "5", ErrorMessageResourceName="DataFormatError", …)] public string? Amount { get; set; } // 千分位+5位

    [Required(…)]
    [RegularExpression(RegularPattern.Decimal_19_10, …)]
    [ToFormat(",.", "10", …)] public string? Rate { get; set; }

    [NumberRange(0, 240, ErrorMessageResourceName="MonthRangeErr240", …)] public string? Months { get; set; } // 0~240 月
    [NumberRange(0, 31,  ErrorMessageResourceName="DaysRangeErr31",  …)] public string? Days  { get; set; }   // 0~31 天

    [RegularExpression(RegularPattern.XSS, …)] public string? LogSN { get; set; }   // 樂觀鎖，前端帶回
    // Lock / Post / LogUser / LogDate … 狀態欄位
}
```

### 4.5 與前端連動的兩個重點（易漏）

1. **動態改變驗證規則後要 `form.validParse()` 重掛**：當 JS 依資料動態改 `data-val-*`（如 `setAmtDgt()` 依幣別改 `data-val-toformat-n` 小數位、`Type` 切換時加/解 `data-val-selectitem`），改完必須呼叫 `form.validParse()`，否則新規則不生效（見 `TdTradeEditor.js`）。
2. **select2 欄位的事件綁定由 adapter 自動處理**：`selectitem`/`requiregroup`/`displayneed` 的 adapter 偵測 `.select2.JpSelect2` 時，會自動改綁 `select2:select/unselect` 觸發即時檢核；View 端 select 記得加 `class="form-control JpSelect2"`。

---

## 5. View（.cshtml）規範

### 5.0 通則

- **檔頭**：子頁（Overview/Editor）`@{ Layout = null; }`（會被當 Partial 載入頁籤，不可帶版面）；`@model [資源][角色]ViewModel`。需要權限/設定時 `@inject IServiceHelper serviceHelper`、`@using Jepun.Core.Common`。
- **表單**：`<form asp-controller="Xxx" asp-action="" jepun-id="FormXxx" jepun-onsubmit="return false" role="form" autocomplete="off">`。`jepun-id` 是 JS `$("#FormXxx")` 的依據（**非** `id`）；`jepun-onsubmit="return false"` 攔截原生送出，一切走 AJAX。
- **欄位繫結優先用 Tag Helper**：`asp-for` / `asp-validation-for` / `asp-items`。這樣 §4 的 ViewModel 驗證屬性才會自動輸出 `data-val-*`，前端 `jepun.valid.js` 才接得到；**手寫 `name="..."` 的欄位不會有前端檢核**（僅限純展示/JS 控制的欄位才這樣寫，如 `LockUser`、`Post`）。
- **樣式**：一律 Bootstrap 5 + 專案 `c-*` 類別（`c-card-expand`、`c-input-item`、`c-input-label`、`c-filter`、`c-pagination_info`），禁混其他 CSS 框架（樣式慣例見 `@docs/frontend-style-guide.md`）。
- **文字走資源檔**：標題/標籤一律 `@Label.Xxx`（多語系），不可硬寫中文。
- **頁尾掛 JS**：`<script src="~/js/apps/Xxx.js" asp-append-version="true"></script>`（編輯頁/總覽頁固定；主檔頁則依 `ViewData["InJsFile"]` 載入）。

### 5.1 主檔頁 View（外殼）

- Header（`l-content-header`）放兩組按鈕群組，分別對應 Overview/Editor，用 `Html.PartialAsync` 載入按鈕 Partial：
  ```cshtml
  <div name="btnGroupTdTradeOverview" data-jepun-btnGroup="btnGroup">
      @await Html.PartialAsync(CommonHelper.buttonsview, new PageNameModel(){ func = "TdTradeOverview" })</div>
  <div name="btnGroupTdTradeEditor"   data-jepun-btnGroup="btnGroup">
      @await Html.PartialAsync(CommonHelper.buttonsview, new PageNameModel(){ func = "TdTradeEditor" })</div>
  ```

  （`buttonsview` 為主工具列、`buttonsminiview` 為精簡列；JS `btnGroupSet`/`btnInit`/`btnSet` 依 `func` 操作這些群組。）
- Sidebar 表單 `jepun-id="FormTdTradeSidebar"`，內含 `nav-tabs`（pill）兩個 `data-bs-target="#AppTab_TdTradeOverview|Editor"`，並有 `name="list-group-item-mask"`（攔點擊先做 `compareChk`）、`name="SidebarTitle"`/`SidebarName`（顯示交易編號）。
- 內容區放兩個**空**頁籤容器，內容由 JS `loadPartialViewPart` 動態載入：
  ```html
  <div id="AppTab_TdTradeOverview" class="tab-pane fade active show"></div>
  <div id="AppTab_TdTradeEditor"   class="tab-pane fade"></div>
  ```

### 5.2 總覽頁 View（清單）

- 檔頭取權限（控制動作鈕可見性）：
  ```cshtml
  @inject IServiceHelper serviceHelper
  @{ RoleModel roleModel = HomeController.GetAppAuthActionDetailRoles(serviceHelper,
         User.Claims.FirstOrDefault(c => c.Type == "Uno")?.Value + "", "TdTradeEditor").GetAwaiter().GetResult(); }
  ```
- **篩選區** `<div class="c-filter collapse c-dont-collapse-lg">`：下拉用 `<select asp-for="Pno" class="form-control select2 border-0" multiple="multiple">`；日期用 `input-daterange` + `data-date-format="yyyy/mm/dd"`。
- **清單表格**：`<table name="Table">` + `<thead>` 欄位 + **空 `<tbody>`** + `<template name="tmp">` 列範本。
  - 列範本以 `{欄位名}` 佔位，由 `tableInject` 對應後端 JSON 欄位填值：`<span>{CltName}</span>`、`<time>{Date}</time>`、金額右對齊 `text-end`、狀態徽章 `<span class="badge rounded-pill {FlowClass}">{FlowStatus}</span>`。
  - 列根掛 `name="clickTr" data-jepun-key="{RowNo}"`（`data-jepun-key` 是 JS `getKeyVal()` 取主鍵的依據）。
  - 勾選：表頭 `name="AllSend"`（全選）、列內 `name="singleSend" data-jepun-key="{RowNo}"`（單列）。
  - **動作鈕用 `name="actionBtn_xxx"` 並以權限包起來**：
    ```cshtml
    @if (roleModel.A_Read) {
        <button name="actionBtn_view"     type="button" class="c-action-btn" data-jepun-key="{RowNo}"><i class="fa-solid fa-eye"></i></button>
        <button name="actionBtn_progress" type="button" class="c-action-btn" data-jepun-key="{RowNo}"><i class="fa-solid fa-clipboard-list"></i></button>
    }
    ```
- **分頁區**：每頁筆數 `<select asp-for="length">`（1/10/20/100/200）+ 結果容器 `<div name="pagination">`（JS `pagination` 套件接管）。
- 欄位寬度用 Bootstrap 原生 `col-*` / `col-lg-*`；要把容器子項均分時用 `jepun-cols-N`（均分 N 等分，N=1~24，見 `@docs/frontend-style-guide.md` §6）。不排序欄加 `sortdisable`。

### 5.3 編輯頁 View（表單）

- 主鍵載體：`<input type="hidden" name="RowNo" />`。
- **標準欄位區塊**（四件組，缺一不可）：
  ```cshtml
  <div class="col-sm-6 col-lg-4">
      <div class="c-input-item">
          <label asp-for="Amount" class="c-input-label">@Label.TdTradeAmount</label>  <!-- ① 標籤(資源檔) -->
          <input asp-for="Amount" type="number">                                       <!-- ② 輸入(帶 data-val-*) -->
          <span asp-validation-for="Amount"></span>                                     <!-- ③ 錯誤訊息掛點 -->
          <span class="jepun-item-txtspan" name="Amount-ShowTxt"></span>                <!-- ④ 唯讀模式顯示文字 -->
      </div>
  </div>
  ```

  - **②必須用 `asp-for`**：§4 的 `[Required]`/`[SelectItem]`/`[ToFormat]`/`[NumberRange]`/`[ChkRule]`… 才會輸出 `data-val-*`，`form.valid()` 才檢核得到。
  - **③ `asp-validation-for` 是錯誤訊息的唯一掛點**；少了它，前端規則失敗時無處顯示。
  - **④ `name="欄位-ShowTxt"`**：檢視（唯讀）模式時，JS 把值寫進此 span 取代輸入框外觀（`form.formInjectText`）。
- **下拉**：`<select asp-for="Type" class="form-control JpSelect2"></select>`（JS `form.find(".JpSelect2").select2()` 初始化；options 由 `form.addSelect()` 動態載入，**不在 cshtml 寫死**）。`JpSelect2` 也讓 §4 `selectitem` adapter 自動改綁 `select2:select/unselect` 即時檢核。
- **日期**：`<input asp-for="Date" data-date-format="yyyy/mm/dd" autocomplete="off" class="form-control">`（JS `datepicker(...)` 初始化）。
- **唯讀欄位**：整個 `col-*` 區塊加 `JepunOnlyRead` class（如 `TradeNo`、`LockUser`、`LockDate`）；檢視模式時 JS 對 `.tab-pane` 加 `JepunOnlyRead` 整頁切唯讀（見 §7 狀態機）。
- **狀態 checkbox**：`name="Lock"`、`name="Post"`（`disabled`，純顯示，由 JS 依狀態勾選/啟用）。
- **群組命名**：需要 JS 整組顯示/停用的欄位，外層 `div` 加 `name="XxxGroup"`（如 `name="OriginNoGroup"`、`name="CurGroup"`）。
- **附件模組掛載點**（編輯頁底固定）：`<div id="ModulePlaceHolder" name="ModulePlaceHolder"></div>`，由 JS `loadPartialViewPart(ModuleEntry, {...})` 注入上傳元件。

> **常見錯誤（對應規則 12「敗得大聲」）**：用 `<input name="Amount">` 取代 `asp-for="Amount"` → 前端不檢核、ViewModel 屬性形同虛設；漏 `asp-validation-for` → 規則失敗卻無提示，看起來「過了」其實沒驗。

---

## 6. JS 規範（jepun.*.js 事件框架）

### 6.1 啟動與物件包裝

```js
const form = $("#FormTdTradeEditor").comm({ isCompare: true }) // isCompare=開啟異動比對(離開前 dirty-check)
                                    .dtIntegration()           // 整合 DataTable
                                    .CardWidget();             // 卡片摺疊
```

- 清單頁加 `.dtIntegration()`；編輯頁加 `.comm({ isCompare: true })` 以支援 `formCompare()` 未存檔離開提醒。

### 6.2 con0 / con1 對應表（強制慣例）

每支 JS 開頭宣告兩個常數物件，集中字串、避免散落：

- **`con0`**：**自己**這支 Controller 的 `name` + 事件名/方法名 + 它要呼叫的其他 Controller/方法（如 `Common`、`GetAppOptionsT4`）。
- **`con1`**：**主檔頁** Controller 的 `name` + 事件名（`GoStep`/`SetCode`/`SetMode`/`SetLock`/`BtnSet`/`GetArgs`…）。

```js
const con0 = { Ini:'Ini', name:'TdTradeEditor', GetTdTradeT2:'GetTdTradeT2', SetTdTradeIns:'SetTdTradeIns', /*…*/ };
const con1 = { name:'TdTrade', GoStep:'GoStep', SetCode:'SetCode', SetMode:'SetMode', BtnSet:'BtnSet', GetArgs:'GetArgs' };
let mainView = $(`#Form${con1.name}`);   // 指向主檔頁表單
```

### 6.3 事件匯流排（三頁溝通的唯一方式）

| API                                                       | 用途                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `form.addHandler(eventName, fn)`                        | 註冊事件處理器（含 `GlbEventType.Ini`、後端 `FormFireHandler` 對應名） |
| `$("#FormX").fireHandler({ type, ...payload })`         | 觸發某表單的事件（跨頁溝通；回傳值為陣列 `[0]`）                         |
| `form.callDataBus("Controller/Action", model, cb)`      | 送 AJAX 到後端；後端 `FormFireHandler` 回觸發同名 `addHandler`         |
| `$(target).loadPartialViewPart(controllerName [,args])` | 載入子頁 Partial 到容器                                                    |

> **鐵則**：子頁要改主檔頁狀態或導覽，一律 `mainView.fireHandler({type: con1.XXX, …})`；**禁止**子頁之間直接互抓 DOM 或呼叫函式。

### 6.4 各頁 JS 職責

**主檔頁 TdTrade.js**

- `Ini`：設定歷史紀錄 `jCom.SetHistory(...)`、載入預設總覽頁 `loadPartialViewPart`。
- 共享狀態 `Args`：以 `GetArgs / SetCode / SetMode / SetLock` 系列 handler 讀寫。
- 導覽：`GoStep` → `sidebar.goStep(...)`；頁籤 `shown.bs.tab` / `hidden.bs.tab` 切換按鈕群組 `btnGroupSet`、顯示/隱藏 Sidebar。
- 離開前 `jFun.compareChk(cb)` 做未存檔檢核。

**總覽頁 TdTradeOverview.js**

- `Ini`：`form.addSelect(...)` 載入篩選下拉、`datepicker`、`select2`，再 `callDataBus(GetTdTradeT1)` 取清單。
- `GetTdTradeT1` handler：`table.tableInject("resetTable", …)` 重繪。
- 按鈕：`btnSet`（顯示/隱藏 Refresh/AddNew/Send）、`btnEvent`（Refresh 重查、AddNew → `getData('-1')` 進新增、Send → `openModal` 送 EFlow 簽核）。
- `iniForm(ele)`：每列繪製後綁定 view/progress/勾選事件。
- `Refresh`：保留目前頁碼重查（編輯返回清單時定位）。

**編輯頁 TdTradeEditor.js**

- `Ini`：載入所有下拉（`addSelect` + `queryKey`）→ `callDataBus(GetTdTradeT2)` 取單筆。
- `GetTdTradeT2`：`form.formInject(obj)` 灌值、`setColReadOnly`、`setAmtDgt`（小數位）、設定 Sidebar 名稱與鎖定狀態、觸發計算。
- 欄位連動（`form.getCtrl("X").on("change", …)`）：日期↔到期日↔月/日互算、`callDataBus` 算利息（`GetTdInterestReceivableCalc`）與淨值（`GetCltMasterYearNavRateCalc`）、相依下拉重載（`accountNoFilter`/`brkAccountNoFilter`）。
- 異動：`btnEvent` 對應 `BtnIns/BtnSave/BtnDel/BtnLock/BtnUnLock/BtnList/BtnCancel`；存檔前 `form.valid()`，刪除前 `jCom.Confirm`。
- **狀態機**：`cellArgs = jCom.ValueCell({})` + `cellArgs.addWatcher((old,new)=>{…})`，依 `Code / EditMode / Lock / Post` 自動切換按鈕群組與唯讀模式（見 §7）。

### 6.5 DOM 存取契約 — 一律走 `getCtrl(name)`，不要 `$("#id")`/`.class`

框架以 **`name` 屬性**（而非 `id`）定位控項，因為同一頁可能載入多個 Partial、`id` 會衝突。

```js
form.getCtrl("Amount")            // 等同 form.find("[name='Amount']")
form.getCtrl("Amount,Rate,Tax")   // 逗號 = 多控項一次取
form.getCtrl("tmp", "jepun-id")   // 第 2 參數改用其他屬性定位（預設 "name"）
```

- **取值/灌值**：`getCtrl(name).val(...)`；切換顯示用 `addClass("d-none")` / `removeClass("d-none")`；停用用 `.disabled()` / `.enabled()`（框架擴充，會處理 input/select/button）。
- **取列主鍵**：`$(this).getKeyVal()` — 從觸發元素往上找到第一個 `data-jepun-key`（止於 `<form>`）。**動作鈕/列一定要帶 `data-jepun-key="{RowNo}"`**，JS 才取得到（見 §5.2）。
- **`data-jepun-*` 屬性契約**（View 與 JS 的接點，不可亂改）：

| 屬性                               | 用途                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| `data-jepun-key`                 | 列/控項主鍵，`getKeyVal()` 來源                        |
| `data-jepun-btnGroup="btnGroup"` | 標記按鈕群組容器，供 `btnSet/btnGroupSet` 整批操作     |
| `jepun-basic-btn`（於按鈕）      | 標記可點擊的基本按鈕，`btnInit` 綁定點擊               |
| `data-jepun-conname`             | Sidebar 連結對應的子頁名                                 |
| `data-jepun-field-holder`        | `formInject` 灌值時保留原值，供 `formCompare()` 比對 |
| `jepun-id="FormXxx"`             | 表單識別（JS `$("#FormXxx")` 實際對應的是這個）        |

### 6.6 資料繫結 API（表單 ↔ JSON）

| API                                           | 方向             | 說明                                                                                                                                                                       |
| --------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `form.formToJSON()`                         | 表單 → JSON     | 序列化所有 input/select/textarea；**同名多值以 `@@` 串接**（多選下拉、checkbox）；序列化時暫時解除 `disabled` 以一併取值                                         |
| `form.formInject(obj [,mask])`              | JSON → 表單     | 依 `name` 灌值（自動處理 radio/checkbox/date/select、多選 `@@` 拆值、select2 重繪）；找不到的 key 會補 `hidden` 當 server 參數；同步寫入 `data-jepun-field-holder` |
| `form.formToText()`                         | 表單 → 顯示文字 | 取下拉/radio 的「顯示文字」而非 value（檢視模式用）                                                                                                                        |
| `form.formInjectText(obj [,addTxt])`        | 文字 → ShowTxt  | 寫進 `name="欄位-ShowTxt"` 的 span（檢視模式顯示；支援 `needMask` 遮罩）                                                                                               |
| `form.formCompare()`                        | 比對             | 回傳「目前值 ≠`data-jepun-field-holder`」的欄位名陣列；為空代表未異動。`comm({isCompare:true})` + `jFun.compareChk()` 的離開檢核即基於此                            |
| `el.setVal(name,val)` / `el.getVal(name)` | 單一控項         | 單欄位讀寫                                                                                                                                                                 |

> 編輯頁載入單筆的標準順序（見 `TdTradeEditor.js` 的 `GetTdTradeT2`）：先 `addSelect` 把相依下拉備好 → `formInject(obj)` 灌值 → `formToText()`＋`formInjectText(data,true)` 補檢視文字 → `select2()` 重繪 → `validParse()` 重掛驗證。

### 6.7 下拉與清單繫結

**下拉 `addSelect(names, opts)`**：以 AJAX 取資料後填 `<option>`，回傳 jQuery deferred（**多個用 `$.when(...).then(...)` 等齊再做後續**）。

```js
$.when(
  form.addSelect("Type", { url: jCom.urlPath(con0.Common, con0.GetAppOptionsT4),
                           queryKey: "TdTrade.Type", showPleaseSelect: true, reload: false }),
  form.addSelect("Cur",  { url: jCom.urlPath(con0.Common, con0.GetCmnCurrencyT4), showPleaseSelect: true })
).then(function () { form.find(".JpSelect2").select2(); /* 全部到位後才初始化 */ });
```

- `reload:true` 不走快取；資料每筆的額外欄位會變成 `data-欄位`（小寫）掛在 option 上（如 option 的 `data-cur`、`data-bno`、`data-amtdgt`），供 change 連動讀取（見 `OriginNo` change 取 `data-cur/data-bno`）。
- 相依下拉重載後要「**還原原選值**」：重載前先存目前值，重載後檢查 option 還在就 `val(原值)`，否則回預設（`accountNoFilter`/`brkAccountNoFilter` 範式）。

**清單 `tableInject`（dtIntegration widget）**：

```js
const table = form.getCtrl("Table").tableInject({ form: form, iniForm: iniForm, dataTable: { order: [] } });
// 後端回資料後重繪（event.data = {Item1:資料, Item2:總筆數, page:頁碼}）
table.tableInject("resetTable", `${con0.name}/${con0.GetTdTradeT1}`, event);
```

- `resetTable` 會：清表 → `tmpInject` 依 `<template name="tmp">` 把 `{欄位}` 套入每列 → 建 DataTable → 重建分頁。
- `iniForm(ele)` 是**每列繪製後的綁定點**：在此綁該列的 `actionBtn_view`/`actionBtn_progress`/`singleSend` 等事件（不可在 `$(document)` 層級綁，列是動態產生的）。

### 6.8 按鈕互動契約（主檔頁集中、子頁實作）

按鈕群組在主檔頁 View，由主檔頁 `btnInit` 綁定；點擊後**轉成事件丟回對應子頁**處理，並用 Deferred 控制按鈕 disable/enable：

```
使用者點按鈕 → btnInit 綁的 click → 產生 dfd(點下先 disable)
            → $("#Form{conName}").fireHandler({ type: GlbEventType.BtnEvent, btn:{name, dfd}, e })
            → 子頁 BtnEvent handler → btnEvent(btn, e) switch(btn.name){…} → 完成呼叫 btn.dfd.resolve()(還原 enable)
```

- 顯示/隱藏：`form.btnSet(conName, "BtnUpd,BtnDel", GlbBtnType.show|hidden|hiddenAll|disabled|enabled)`。
- 切群組：`tab.btnGroupSet(form)`（先全隱藏再顯示該頁群組）。
- 子頁**不自己抓按鈕 DOM**，只在 `BtnEvent` handler 內依 `btn.name`（`GlbBtnList.BtnIns/BtnSave/BtnDel/...`）分派，並務必 `btn.dfd.resolve()`（否則按鈕一直 disabled）。

### 6.9 互動全圖與禁止事項

```
[Overview] 篩選/分頁 change ─callDataBus(GetT1)→ Controller ─FormFireHandler→ GetT1 handler ─tableInject→ 清單
            點 actionBtn_view ─getKeyVal→ mainView.fireHandler(SetCode/SetMode/GoStep) ─goStep→ 切到 Editor 頁籤
[Editor]   shown.bs.tab ─loadPartialViewPart→ 載入 Editor → Ini ─addSelect/callDataBus(GetT2)→ formInject 灌值
            欄位 change ─callDataBus(算利息/淨值)→ handler 回填；cellArgs.update→ watcher→ btnSet/唯讀
            按 Save ─form.valid()→ callDataBus(SetUpd)→ 成功 fireHandler(Overview.Refresh) 回列表定位原頁碼
```

- ❌ 子頁間直接 `$("#FormOther")` 抓 DOM 或呼叫對方函式 → 一律經 `mainView.fireHandler(con1.XXX)`。
- ❌ 用 `$("#id")` / `.class` 取控項 → 用 `form.getCtrl(name)`。
- ❌ 在 cshtml 寫死 `<option>` → 用 `addSelect`。
- ❌ 動態改 `data-val-*` 後忘記 `form.validParse()`（見 §4.5）。
- ❌ `btnEvent` 忘記 `btn.dfd.resolve()` → 按鈕卡在 disabled。
- ❌ 在 `$(document).ready` 綁動態列事件 → 改在 `iniForm(ele)` 內綁。

---

## 7. 編輯頁狀態機（最關鍵、最易錯）

編輯頁的「按鈕顯示」與「唯讀/可編輯」**全部由 `cellArgs` 反應式狀態驅動**，不要散在各事件裡硬切：

| 狀態值       | 意義                | 影響                                                                                             |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------ |
| `Code`     | 主鍵（`-1`=新增） | `-1` → 顯示「新增」鈕；否則「修改/刪除」                                                      |
| `EditMode` | 是否編輯中          | `true` → 移除 `JepunOnlyRead`、顯示 儲存/取消；`false` → 整頁唯讀、顯示 修改/刪除 + 鎖定 |
| `Lock`     | 是否鎖定            | `1` → 只留 返回 + 解鎖                                                                        |
| `Post`     | 是否已過帳          | `true` → `disabled` 全部異動鈕（已過帳不可改）                                              |

```js
cellArgs.addWatcher(function (oldValue, newValue) {
    if (oldValue.Code !== newValue.Code) mainView.fireHandler({ type: con1.SetCode, Code: newValue.Code });
    btnSet(GlbBtnType.hiddenAll); btnSet(GlbBtnType.list);
    mainView.fireHandler({ type: con1.SetMode, EditMode: newValue.EditMode });
    if (newValue.EditMode) {
        form.closest('.tab-pane').removeClass("JepunOnlyRead");
        String(newValue.Code) === "-1" ? btnSet(GlbBtnType.ins) : btnSet(GlbBtnType.save);
    } else {
        form.closest('.tab-pane').addClass("JepunOnlyRead");
        btnSet(GlbBtnType.upd); btnSet(GlbBtnType.lock);
        if (newValue.Lock === 1) { btnSet(GlbBtnType.hiddenAll); btnSet(GlbBtnType.list); btnSet(GlbBtnType.unlock); }
    }
    if (String(newValue.Post) === "true") btnSet(GlbBtnType.disabled);
});
```

> 改按鈕邏輯時**只動 watcher 與 `btnSet`**，不要在零散的 change/click 裡重複切換，否則狀態會打架（對應 `CLAUDE.md` 規則 7：折衷程式碼最糟）。

---

## 8. 橫向關注點（跨頁共用機制）

- **樂觀鎖**：Editor ViewModel 帶 `LogSN`，更新/刪除由 SP 比對；版本不符 SP 回 `'CheckRowVersion'`，前端統一提示「資料已被異動」（見 `@docs/database-conventions.md`）。
- **鎖定 / 過帳**：`SetTdTradeUpdLock`（鎖定/解鎖共用）；`Post=true` 鎖死編輯。
- **EFlow 簽核**：總覽頁勾選多筆 → `GlbAppFullPage.openModal(StandardFdfSignMap/TdTrade, {RowNos})` 送簽；列上 `actionBtn_progress` 看簽核紀錄 `StandardFdfSignMapLog`。對應模組 `Fdf`（見 `@docs/solution-guide.md` 模組矩陣）。
- **附件上傳模組**：編輯頁 `#ModulePlaceHolder` + `loadPartialViewPart(ModuleEntry, {KeyNo, KeyType, FromForm, SignType})`。
- **小數位/金額格式**：`setAmtDgt(amtDgt, rateDgt)` 依幣別動態設 `data-val-toformat-n` 後 `form.validParse()`；金額相加用 `jFun.CommasToNum()` 去千分位。
- **權限**：總覽頁由 `RoleModel`（`A_Read` 等）控制動作鈕；`Ini` 下放 `IsAdmin`。
- **下拉相依**：`form.addSelect(name, {url, queryKey, showPleaseSelect, reload})`；相依欄位 change 時重載並還原原選值（`accountNoFilter` 範式）。

---

## 9. 新增一個主從頁 Checklist

```
後端（先完成 SP→DAL→Proto→Grpc→Bulkhead→ServiceHelper，見 solution-guide §10）
1. ViewModel   Models/[模組]/[資源]OverviewViewModel(:PaginationModel) + [資源]EditorViewModel（含 XSS/驗證/LogSN） → 驗證：編譯
2. 主檔頁      Controller(Index+Ini) + Views/[資源]/Index.cshtml(頁籤殼) + apps/[資源].js(導覽/Args/按鈕群組) → 驗證：頁籤可切換
3. 總覽頁      Controller(Index/Ini/Get…T1) + View(篩選+table template+分頁) + js(addSelect/tableInject/btnEvent) → 驗證：清單可查、分頁正確
4. 編輯頁      Controller(Get…T2/T3/Set…Ins/Upd/Del/UpdLock) + View(c-input-item 欄位) + js(cellArgs 狀態機+連動) → 驗證：新增/修改/刪除/鎖定/驗證皆正確
5. 橫向        EFlow 送簽 + 附件模組 + 樂觀鎖 CheckRowVersion 提示 → 驗證：送簽流程、版本衝突提示
```

每步完成設檢查點（規則 10）；不確定是否成功要敗得大聲（規則 12）。**Controller 不得寫商業邏輯、前端不得處理商業邏輯**（核心規則 1、4）。
