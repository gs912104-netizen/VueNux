# 多語系資源檔（i18n）開發指引

> 本文件規範本專案 **多語系字串資源** 的實際慣例，內容對齊 `Resource/Jepun.AM.Resource` 既有檔案與 Web 端用法。
> 核心鐵則（`CLAUDE.md`、`@docs/frontend-ui-guide.md` §5）：**所有顯示文字、錯誤訊息一律走資源檔，禁止在 C# / cshtml / JS 硬寫中文字串。**

---

## 1. 概述

- **專案**：`Resource/Jepun.AM.Resource`（net8.0 Class Library），命名空間 `Jepun.AM.Resource`。
- **存取方式**：以 `.resx` + `PublicResXFileCodeGenerator` 產生**強型別**靜態類別（`Label`、`Err`、`Report`、`Tour`），屬性即 key（如 `Label.Account`）。
- **語系決議**：底層用 `ResourceManager.GetString(key, CurrentUICulture)`；目前執行緒的 UI 文化由 `CultureFilterAttribute` 依 `JepunCulture` cookie 設定（見 §4）。
- 被 Web（`Jepun.AM.Web`）以 `ProjectReference` 引用；gRPC / DAL 層不直接用（訊息以 `Err` key 字串往上傳，由 Web 轉文字）。

---

## 2. 檔案結構

每個「資源家族」固定三個檔案：

| 檔案 | 角色 | 可否手改 |
| ---- | ---- | -------- |
| `[家族].resx` | **中性（預設）語系 = 繁體中文 zh-TW** | ✅ 編輯字串 |
| `[家族].en-us.resx` | 英文 en-US | ✅ 編輯字串 |
| `[家族].Designer.cs` | 由 `.resx` 自動產生的強型別存取類別 | ❌ **自動產生，禁止手改** |

> 中性 `.resx` 即繁中（無另立 `.zh-TW.resx`）；它同時是**所有語系的 fallback**——查不到對應語系的 key 時回中性值。

### csproj 設定（`Jepun.AM.Resource.csproj`）

每個 `.resx` 對應一組設定，新增家族時請沿用：

```xml
<EmbeddedResource Update="Label.resx">
  <Generator>PublicResXFileCodeGenerator</Generator>   <!-- 產生 public 強型別類別 -->
  <LastGenOutput>Label.Designer.cs</LastGenOutput>
</EmbeddedResource>
<Compile Update="Label.Designer.cs">
  <DesignTime>True</DesignTime>
  <AutoGen>True</AutoGen>
  <DependentUpon>Label.resx</DependentUpon>          <!-- 隨 .resx 重新產生 -->
</Compile>
```

> `en-us.resx` **不需要**自己的 Generator/Designer——衛星語系檔只提供翻譯值，共用中性檔產生的類別。

---

## 3. 四個資源家族（用途與現況）

| 家族 | 類別 | 用途 | 條目數（zh-TW / en-US） |
| ---- | ---- | ---- | ----------------------- |
| `Label` | `Label` | **UI 顯示文字**：標籤、按鈕、欄位名、分頁文字、placeholder 等 | 1757 / 1757 |
| `Err`   | `Err`   | **錯誤訊息**：驗證錯誤、業務錯誤碼對應訊息（與 SP / gRPC 回傳的 Err key 對齊） | 172 / **165** ⚠️ |
| `Report`| `Report`| **報表專用字串**：報表標題、欄位、頁尾 | 234 / 234 |
| `Tour`  | `Tour`  | **導覽（guided tour）字串**：新手引導步驟說明 | 14 / 14 |

選用原則：UI 標籤放 `Label`；任何錯誤/驗證訊息放 `Err`；報表文字放 `Report`；導覽放 `Tour`。**不要把錯誤訊息塞進 `Label`**（會破壞 `ResourceAdapter.GetResourceString(typeof(Err), ...)` 的對應，見 §5.3）。

---

## 4. 支援語系與切換機制

### 4.1 支援語系

`CultureFilterAttribute` 支援 **3 種語系**：`zh-TW`（預設）、`en-US`、`km-KH`。

> **現況技術債（高棉語）**：`km-KH` 已在 Filter 列入判斷，但 **`Resource/` 內尚無任何 `*.km-KH.resx`**。因此選 km-KH 時，所有字串會 **fallback 回中性（繁中）**。要正式支援 km-KH，需為各家族新增 `[家族].km-KH.resx`（key 與中性檔對齊）。

### 4.2 切換流程

```
使用者選語言（CultureSetting 頁）
  → CultureSettingController.setLanguageCookies(Culture)   寫入 JepunCulture cookie
  → 之後每個 Action：CultureFilterAttribute.OnActionExecuting
       讀 JepunCulture cookie（zh-TW / en-US / km-KH，預設 zh-TW）
       → CultureHelper.SetThreadCulture(culture)           設定執行緒 UI 文化
       → 回寫 cookie（HttpOnly / Secure / SameSite=Strict，逾期 = JepunConfig.CookieExpires）
  → Label.Xxx / Err.Xxx 依當前 UI 文化回對應語言字串
```

- Cookie 名稱固定 **`JepunCulture`**；無 cookie 時預設 `zh-TW`（`CultureSettingController.Ini` 則回退瀏覽器語系供下拉顯示）。
- 需要套語系的頁面/Controller 掛 `[CultureFilter]`。

---

## 5. 存取資源的三種方式

### 5.1 cshtml / C# — 強型別（最常用）

```cshtml
<label class="c-input-label">@Label.Account</label>   @* UI 標籤 *@
<th>@Label.LogDate</th>
```

```csharp
BootstrapAlert(Label.Message, Label.BaseInsSucces);    // 直接取靜態屬性
```

> View 與一般顯示文字一律 `@Label.Xxx`；**禁止硬寫中文**（`frontend-ui-guide.md` §5.0）。

### 5.2 ViewModel 驗證屬性 — 資源 key（專案主要錯誤訊息來源，4000+ 處）

驗證錯誤訊息**不寫死字串**，改指向 `Err` 的 key：

```csharp
[Required(ErrorMessageResourceName = "MustRequired", ErrorMessageResourceType = typeof(Err))]
[SelectItem("-1", ErrorMessageResourceName = "MustRequired", ErrorMessageResourceType = typeof(Err))]
[RegularExpression(RegularPattern.XSS, ErrorMessageResourceName = "XSS", ErrorMessageResourceType = typeof(Err))]
public string? Pno { get; set; }
```

### 5.3 動態 key — `ResourceAdapter.GetResourceString`（gRPC 錯誤碼轉訊息，565 處）

gRPC 業務錯誤以 `StringObj.Err` 回傳「Err 的 key 字串」（見 `@docs/grpc-contracts.md`），Controller 再轉成當前語系訊息：

```csharp
var retVal = await _serviceHelper.SetTdTradeInsAsync(model.GetEntityHashtable());
if (!retVal.IsOk)
{
    BootstrapAlert(Label.Error,
        ResourceAdapter.GetResourceString(typeof(Err), retVal.GetErr),  // key → 當前語系訊息
        "danger");
    return JQuery.ToString();
}
```

> `ResourceAdapter` 來自框架 DLL（`Jepun.Core.Web` / `Jepun.Web.Base`），用於「執行期才知道 key」的情境。固定文字請優先用 §5.1 強型別。

---

## 6. 命名規則

- **key 一律 PascalCase**：`Account`、`LogDate`、`MustRequired`、`CheckRowVersion`。
- 語意化、可重用：通用標籤（`CreateUser`、`LogDate`、`PleaseInput`）放共用 key，不要每頁各造一個。
- `Err` 的 key 需與**後端回傳的錯誤碼字串對齊**（SP / gRPC 回什麼字串，`Err` 就要有同名 key），例如樂觀鎖 `CheckRowVersion`、表單必填 `MustRequired`。
- 同一概念在 4 個家族不重名混用；UI 用 `Label`、錯誤用 `Err`。

---

## 7. 新增 / 修改字串的標準流程

```
1. 決定家族：UI→Label、錯誤→Err、報表→Report、導覽→Tour
2. 在 [家族].resx 新增 <data name="Key">（中性 = 繁中值）
3. 在 [家族].en-us.resx 新增「同一個 Key」的英文值        ← 必做，缺了英文會 fallback 繁中
4.（未來支援 km-KH 時）在 [家族].km-KH.resx 補同 Key
5. 存檔 → Designer.cs 由 PublicResXFileCodeGenerator 自動重產（勿手改）
6. 程式引用：@Label.Key / ErrorMessageResourceName="Key" / GetResourceString(typeof(Err),"Key")
   驗證：編譯通過（強型別 key 不存在會編譯失敗）、切換語系顯示正確
```

> **所有語系檔的 key 必須同步**。只加中性、忘了 en-US，英文使用者就看到中文（規則 12：敗得大聲，別讓缺漏靜默通過）。

---

## 8. Do / Don't

**Do**
- 顯示文字、錯誤訊息一律放 resx，用 `@Label.Xxx` / `typeof(Err)` 引用。
- 新增 key 時，**中性 + en-US 同步**（未來含 km-KH）。
- 重用既有通用 key（`MustRequired`、`LogDate` 等）。
- `Err` key 與後端回傳的錯誤碼字串對齊。

**Don't**
- ❌ 在 C# / cshtml / JS 硬寫中文（或任何語言）字串。
- ❌ 手改 `*.Designer.cs`（自動產生，會被覆蓋）。
- ❌ 只加一種語系就當完成。
- ❌ 把錯誤訊息塞進 `Label`（破壞 `GetResourceString(typeof(Err),…)` 對應）。
- ❌ 給 `en-us.resx` 另設 Generator/Designer（衛星檔只放翻譯值）。

---

## 9. 現況待辦 / 已知技術債（敗得大聲）

> 統一列管於 `@docs/tech-debt.md`（I18N-1 / I18N-2）；此處保留摘要。

整理時實測發現以下缺漏：

1. ~~**`Err.en-us.resx` 缺 7 個英文翻譯**~~ ✅ **已補齊**（`IncorrectVerificationCodeTryAgain`、`MustNotInput`、`MustRange`、`MustSelect`、`PhoneFormat`、`StartTime`、`StartTimeNotInPast`）；`Err.resx` 與 `Err.en-us.resx` 現皆 172 筆、key 完全對齊。
2. **km-KH 尚無任何資源檔**：Filter 已支援 `km-KH`，但 `Resource/` 無 `*.km-KH.resx`，選此語系全部 fallback 繁中（見 §4.1）。
3. 各 `.resx` 檔頭的 `Name1` / `Color1` / `Bitmap1` / `Icon1` 是 .NET resx **範本註解範例**（非實際資料），可忽略。
