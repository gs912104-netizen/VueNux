# 前端樣式（CSS）開發指引

> 本文件規範本專案 **CSS / 樣式層** 的實際慣例，內容直接對齊 `Web/Jepun.AM.Web/wwwroot/css` 既有檔案。
> 上層規範以 `CLAUDE.md`、`@docs/frontend-ui-guide.md`（三檔式主從頁 UI 結構）為準；本文件只補「樣式檔案分工、設計 Token、class 命名與元件目錄」。
> UI 結構與 jQuery 事件框架請看 `@docs/frontend-ui-guide.md`；本文件聚焦「長什麼樣、用哪個 class」。

---

## 1. 框架基底（重要澄清）

`CLAUDE.md` / `architecture.md` 對外簡稱「Bootstrap 5」，**實際基底為 Bootstrap 5.2 + AdminLTE 4**（見 `Views/Shared/_Layout.cshtml` 註解 `<!-- Bootstrap v5.2.0 & AdminLTE 4.0 -->`）。

- **基底框架**：Bootstrap 5.2 + AdminLTE 4，編譯為單一 `wwwroot/css/all.css`（約 38,000 行，**屬編譯產物，禁止手改**）。
- **設計系統 / 客製**：集中在 `jepun-custom.css`，以 CSS 變數覆寫 Bootstrap、並定義專案自有元件（`c-*` / `l-*` / `jepun-*`）。
- 規範「禁止混用其他 CSS Framework」仍成立：AdminLTE 是 Bootstrap 5 的後台模板層，非另一套對等框架。

---

## 2. 樣式檔案結構與載入順序

`wwwroot/css/` 下與專案直接相關的檔案：

| 檔案 | 角色 | 可否手改 |
| ---- | ---- | -------- |
| `all.css`（+ `.map`） | Bootstrap 5.2 + AdminLTE 4 編譯包（基底） | ❌ 編譯產物，勿改 |
| `site.css` | 站台層覆寫：唯讀切換機制、版面修正、浮動選單等 | ✅ 站台級全域樣式 |
| `jepun-custom.css` | **專案設計系統**：CSS 變數（品牌色）、`c-*`/`l-*`/`jepun-*` 元件 | ✅ **改樣式的主要落點** |
| `bs5-print.css` | 列印專用樣式 | ✅ 僅列印情境 |
| `dark/adminlte-dark-addon.css` | 深色模式附加（目前 `_Layout` 註解未啟用） | ⚠️ 啟用深色模式才動 |
| `Module/Module*.css` | 特定模組專用樣式（ESG Portal、PDF 編輯/列印） | ✅ 限該模組 |

### 載入順序（`Views/Shared/_Layout.cshtml`）

```
1. 第三方外掛 CSS：fontawesome、bootstrap-icons、bootstrap-colorpicker、
   bootstrap-datepicker、icheck-bootstrap、select2-bootstrap-5-theme、datatables(bs5)
2. ~/css/all.css        ← 基底（Bootstrap + AdminLTE）
3. ~/css/site.css       ← 站台覆寫
4. ~/css/jepun-custom.css ← 專案設計系統（最後載入＝最高優先，覆寫前面）
```

> **鐵則**：要調整外觀，改 `jepun-custom.css`（或 `site.css`），**不要去改 `all.css`**；它是編譯產物，下次重新編譯就被覆蓋（規則 3：精準修改、規則 8：先讀再改）。

---

## 3. 設計 Token（CSS 變數 / 品牌色盤）

`jepun-custom.css` 的 `:root` 以 Bootstrap 變數命名（`--bs-*`）覆寫主題色，**新樣式一律引用變數，禁止硬寫色碼**。

### 3.1 品牌色盤（節錄自 `:root`）

| 變數 | 色值 | 語意 |
| ---- | ---- | ---- |
| `--bs-brand` | `#002a5e` | 品牌深藍（標題/導覽強調） |
| `--bs-primary` | `#10574e` | 主色（深綠，按鈕/重點） |
| `--bs-secondary` | `#30a39a` | 次色（連結 `--bs-link-color`） |
| `--bs-success` | `#21ae8c` | 成功 |
| `--bs-warning` | `#ffb22b` | 警告 |
| `--bs-danger` | `#dc2626` | 危險/錯誤 |
| `--bs-accent` | `#ed1b2e` | 強調紅（CDF 主色，少量點綴） |
| `--bs-digital` | `#14e6f1` | 數位青（特效） |
| `--bs-highlight` / `--bs-highlight-bg` | `#fff0d5` | 高亮底 |
| `--bs-primary-200/600/800` | `#cfdddc` / `#709a95` / `#407971` | 主色階（卡片/表頭/邊線） |

> 每個主題色都有對應的 `--bs-*-rgb`（如 `--bs-primary-rgb: 16, 87, 78`），給 `rgba(var(--bs-primary-rgb), .x)` 用。

### 3.2 字體 / 圓角 / 邊線

| 變數 | 值 | 說明 |
| ---- | -- | ---- |
| `--bs-font-sans-serif` | `"Microsoft JhengHei", system-ui, "Segoe UI", …` | 全站字體（繁中優先） |
| `--bs-border-color` | `#bbc2c1` | 預設邊線色（表單外框 `2px solid`） |
| `--bs-border-radius` / `-lg` / `-xl` / `-pill` | `.25rem` / `.5rem` / `1rem` / `50rem` | 圓角階 |
| `--bs-body-color` / `--bs-body-bg` | `#212529` / `#ffffff` | 內文 / 背景 |

> 取色一律 `var(--bs-primary)` 等；需要透明度用 `rgba(var(--bs-primary-rgb), .5)`。**不要在 cshtml inline style 或 JS 硬寫色碼。**

---

## 4. Class 命名規則（三個前綴）

本專案自有樣式以前綴區分職責，與 Bootstrap util 並用：

| 前綴 | 意義 | 範例 | 何時用 |
| ---- | ---- | ---- | ------ |
| `c-*` | **Component（元件）** | `c-card`、`c-input-item`、`c-filter`、`c-action-btn` | 有固定外觀/結構的可重用 UI 區塊 |
| `l-*` | **Layout（版面）** | `l-content-header`、`l-navbar`、`l-content-layout` | 頁面骨架、區域容器 |
| `jepun-*` | **功能性 utility / 行為掛點** | `jepun-cols-N`、`jepun-item-txtspan` | 排版工具、與 JS 連動的樣式狀態 |
| `Jepun*`（無連字號，PascalCase） | **狀態切換 class（由 JS 加掛）** | `JepunOnlyRead`、`JepunOnlyReadShow/Hide` | 整區唯讀/顯示切換（見 §6） |

> 子元素命名沿用 BEM 風格變體：`_` 表子元件（`c-formList_header`）、`--` 表修飾子（`c-avator_item--small`、`c-attachment--del`）。新增元件請延續此風格（規則 11）。
>
> **優先順序**：能用 Bootstrap util（`d-none`、`text-end`、`row`、`col-*`、`badge` …）就用 Bootstrap；專案特有外觀才開 `c-*`。不要為一次性樣式新增 class（規則 2）。

---

## 5. 元件目錄（對照 `jepun-custom.css`，節錄）

> 完整定義以 `jepun-custom.css` 為準；下表標出用途與大致行號，方便查找。

### 5.1 版面 Layout（`l-*`）

| Class | 用途 |
| ----- | ---- |
| `l-content-header` | 頁面標題列（按鈕群組所在；`padding: .875rem 2.25rem`），可搭 `sticky-top` |
| `l-content-body` / `l-content-layout` | 內容主體 / 內容包裹（`content-wrapper` 捲動） |
| `l-navbar` / `l-navbar_btn` / `l-navbar_menu` | 頂部導覽列與其按鈕/選單 |
| `l-container_main` / `l-container_row` / `l-container_status` | 主容器 / 列容器 / 狀態列 |

### 5.2 卡片 Card

| Class | 用途 |
| ----- | ---- |
| `c-card` | 基本卡片（圓角 `.5rem`、淺灰底 `#f8f9fa`、`1px` 邊） |
| `c-card_outline` | 外框卡片（標題綠 `#407971`、無陰影） |
| `c-card-expand` | 可摺疊卡片（搭配 JS `.CardWidget()`；標題色 `--bs-primary`） |

### 5.3 表單 Form

| Class | 用途 |
| ----- | ---- |
| `c-input-item` | **單一欄位容器**（`position: relative`、底距 `.5rem`）；§6 唯讀切換以此為作用域 |
| `c-input-label` | 欄位標籤（粗體、深藍 `#001f3f`、`.875rem`） |
| `c-form-control_line` | 線條式輸入樣式 |
| `jepun-item-txtspan` | **唯讀檢視時顯示值的 span**（平時 `display:none`，唯讀模式才顯示；對應 `name="欄位-ShowTxt"`） |

> 表單外框預設 `2px solid var(--bs-border-color)`；`focus` 變 `#59b5ae`；驗證失敗 `input-validation-error` 變紅框（Bootstrap 驗證樣式已客製，見 `jepun-custom.css` 行 464–496）。

### 5.4 篩選 Filter

| Class | 用途 |
| ----- | ---- |
| `c-filter` | 篩選列容器（淺綠底 `#e7eeed`）；總覽頁常搭 `collapse c-dont-collapse-lg` 在大螢幕常駐 |
| `c-advancedFilter` | 進階篩選切換鈕（含數字徽章） |

### 5.5 清單 / 表格 / 分頁

| Class | 用途 |
| ----- | ---- |
| `c-formList` / `c-formList_header` / `c-formList_body` / `c-formList_subtitle` | 主從頁左側清單（Sidebar 列表；`.active` 項右側綠色標記） |
| `c-action-btn` | DataTable 列內動作圖示鈕（綠 `#588983`，hover `--bs-primary`） |
| `c-pagination_info` | 分頁資訊容器（整合 paginationjs；**注意：不是 `c-pagination_*`**） |
| `c-rwdTable-cell--light` | RWD 表格淺色儲存格 |

### 5.6 頁籤 Tabs

| Class | 用途 |
| ----- | ---- |
| `c-segmented` | 可橫向捲動的分段頁籤（`active` 底線 `3px`） |
| `c-navtabs` / `c-navTabs` | 導覽頁籤樣式 |

### 5.7 其他既有元件

| Class | 用途 |
| ----- | ---- |
| `c-avator_list` / `c-avator_item` / `--small` | 頭像群（圓形、可疊放） |
| `c-badge_point` / `--cost` | 圓點徽章 |
| `c-dragUpload` / `c-attachment--del` | 拖曳上傳區 / 附件刪除鈕 |
| `c-page` / `c-page_a4` / `c-page_wrapper` | 列印頁面（A4、`@page` 控制） |
| `c-segmented`、`c-nav-search`、`c-placeholder` | 分段列、搜尋框、佔位 |

---

## 6. 均分排版：`jepun-cols-N`（更正既有文件）

容器加 `jepun-cols-N`，其**直接子元素**會被均分為 N 等分寬度（`width: 100/N %`），N 從 **1 到 24**。

```html
<!-- 子項各佔 1/4 寬 -->
<div class="row jepun-cols-4">
  <div>…</div><div>…</div><div>…</div><div>…</div>
</div>
```

> **勘誤**：`@docs/frontend-ui-guide.md` §5.2 寫「欄位寬度用 `jepun-col24-n`（24 格系統）」與實作不符。實際 class 為 **`jepun-cols-N`（均分 N 等分，非 24 格 span 系統）**。需要 12/24 格 span 時請用 Bootstrap 原生 `col-*` / `col-lg-*`。

---

## 7. 唯讀切換機制（`JepunOnlyRead`）

主從頁的「檢視 / 編輯」外觀切換**完全由 CSS class 驅動**（見 `site.css` 行 8–63），與 `frontend-ui-guide.md` §5.3、§7 狀態機呼應：

| Class（由 JS 掛在 `.tab-pane` 或容器） | 效果 |
| ------------------------------------- | ---- |
| `JepunOnlyRead` | 作用域內 `c-input-item` 的 `input/select/textarea/select2/附件刪除鈕`**全部隱藏**，改顯示 `jepun-item-txtspan`（唯讀文字） |
| `JepunValidOnlyRead` | 同上，用於「驗證唯讀」情境 |
| `JepunOnlyReadShow` | 平時 `display:none`，**僅在唯讀模式顯示** |
| `JepunOnlyReadHide` | 唯讀模式時**隱藏** |

機制要點（前後端契約，勿破壞）：

- 欄位四件組（標籤 / `asp-for` 輸入 / `asp-validation-for` / `name="欄位-ShowTxt"` 的 `jepun-item-txtspan`）缺一不可（見 `frontend-ui-guide.md` §5.3）。
- JS 對整頁切唯讀＝對 `.tab-pane` 加/移 `JepunOnlyRead`；不要逐欄位手動 `disabled` 來「假裝唯讀」。
- 唯讀文字框 `jepun-item-txtspan` 已含深色模式樣式（`.dark-mode`）。

---

## 8. 第三方外掛樣式整合

下列外掛已在 `jepun-custom.css` 客製為品牌色，使用時沿用既有 class、勿另立樣式：

- **select2（bootstrap-5 theme）**：外框/下拉/選中色已客製（行 955+）；驗證失敗 `input-validation-error` 連動紅框。View 端 select 記得加 `class="form-control JpSelect2"`（JS 初始化 select2）。
- **DataTables（bs5）**：表頭底色 `#cfdddc`、排序箭頭、斑馬列已客製（行 778+）。
- **bootstrap-datepicker / colorpicker / icheck / note-editor（summernote）**：皆已套品牌色；唯讀模式下 note-editor 工具列隱藏、編輯區 `pointer-events:none`。

---

## 9. Do / Don't

**Do**

- 改外觀 → 改 `jepun-custom.css`（元件/變數）或 `site.css`（站台全域）。
- 取色 → `var(--bs-primary)` 等變數；透明度用 `rgba(var(--bs-*-rgb), .x)`。
- 新元件 → 依 `c-* / l-* / jepun-*` 前綴 + BEM（`_` 子件、`--` 修飾）命名。
- 能用 Bootstrap util 就用 Bootstrap util（`d-none`、`text-end`、`row/col-*`、`badge` …）。
- 唯讀切換 → 用 `JepunOnlyRead` 機制，搭配 `c-input-item` + `jepun-item-txtspan` 四件組。

**Don't**

- ❌ 手改 `all.css`（Bootstrap/AdminLTE 編譯產物）。
- ❌ 在 `.cshtml` 寫 inline `style="color:#xxx"` 硬色碼 / 行內樣式（少數動態計算除外）。
- ❌ 引入第二套 CSS 框架或自帶 reset。
- ❌ 為一次性樣式新增 `c-*` class（規則 2）。
- ❌ 用 `jepun-cols-N` 當 24 格 span 用（它是均分，見 §6）。

---

