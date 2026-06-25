# 資料庫規範文件

## 設計原則

1. **商業邏輯集中於 Stored Procedure**，應用層不得直接下 SQL
2. **新表一律採軟刪除**（`IsDel`），不做實體 DELETE；既有無 `IsDel` 的舊表屬待補欄位的技術債
3. SP 是應用層與資料庫的唯一合約，修改 SP 需同步更新 DAL（`SqlMapping.cs` 與 `[模組]Service.cs`）
4. SP / Table 原始檔納入版控（`DB/Jepun.AM.DB/`）

---

## 資料表設計規範

### 必要欄位

每張資料表必須包含以下欄位：

| 欄位名稱       | 型別             | 說明                                      |
| -------------- | ---------------- | ----------------------------------------- |
| 主鍵           | `INT IDENTITY`   | 命名沿用該表既有慣例：`Uno` / `RowNo` / `Bno` / `Cno` 等；無既定慣例的新表用 `RowNo` |
| `CreateUser`   | `INT`            | 建立人員                                  |
| `CreateDate`   | `DATETIME2(3)`   | 建立時間                                  |
| `LogUser`      | `INT`            | 異動人員                                  |
| `LogDate`      | `DATETIME2(3)`   | 異動時間                                  |
| `LogSN`        | `ROWVERSION`     | 異動版本（樂觀鎖，由 DB 自動產生）        |
| `IsDel`        | `BIT`            | 軟刪除旗標，`DEFAULT 0`（**新表必加**）   |

> **既有舊表（如 `AppUsers`）未含 `IsDel`** 屬技術債；改動到該表時走 `DB/Jepun.AM.DB/2-AlterTable/` 補上，並同步調整對應 SP 的 `WHERE` 條件。

### 範本（取自 `DB/Jepun.AM.DB/0-Table/Td/TdMasterParam.sql`）

```sql
USE JEPUN_AM_CDF
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = OBJECT_ID(N'[dbo].[TdMasterParam]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[TdMasterParam]
GO
--定存利息計算參數設定檔
CREATE TABLE [dbo].[TdMasterParam] (
    [RowNo]       [int] IDENTITY(1, 1) NOT NULL,    --資料編號
    [ComNo]       [int]                NOT NULL,    --公司別代號 對應 CmnCompany
    [Bno]         [int]                NOT NULL,    --銀行代號 對應 CmnBroker
    [Cur]         [varchar](5)         NOT NULL,    --幣別 對應 CmnCurrency
    [Date]        [date]               NOT NULL,    --生效日期
    [Period]      [nvarchar](10)       NOT NULL,    --計息方式 (AppOptions.QueryKey = CalcPeriod)
    [LastPeriod]  [nvarchar](10)       NOT NULL,    --畸零天數計息方式
    [YearDays]    [nvarchar](10)       NOT NULL,    --年天數 (AppOptions.QueryKey = YearDays)
    [TaxRound]    [nvarchar](10)       NOT NULL,    --稅額進位方式
    [Remark]      [nvarchar](100)      NOT NULL,    --備註

    -- 必要系統欄位
    [CreateUser]  [int]                NOT NULL,    --建立人員
    [CreateDate]  [datetime2](3)       NOT NULL,    --建立時間
    [LogUser]     [int]                NOT NULL,    --異動人員
    [LogDate]     [datetime2](3)       NOT NULL,    --異動時間
    [LogSN]       [rowversion]         NOT NULL,    --異動版本
    [IsDel]       [bit]                NOT NULL,    --是否刪除 0.否 1.是

    CONSTRAINT [PK_TdMasterParam] PRIMARY KEY CLUSTERED ([RowNo]) ON [PRIMARY]
) ON [PRIMARY]
GO
```

> 完整檔案另含 `sp_addextendedproperty` 寫入表/欄位中文描述；新表建立時請沿用該段樣板。

---

## 命名規則

### 資料表（Table）

- 使用 **PascalCase**，依「模組前綴 + 名詞」命名
- 範例：`AppUsers`、`TdMasterParam`、`BndTrade`、`CmnBroker`

### 欄位（Column）

- 使用 PascalCase
- 既有縮寫沿用既定慣例（`Bno`、`Cno`、`ComNo`、`Cur`、`Pno`…），不強制改為全名
- 布林欄位以 `Is` 為前綴：`IsDel`、`IsManager`、`Enabled`

### 索引（Index）

```
IX_資料表_欄位        → IX_TdMasterParam_Bno
UQ_資料表_欄位        → UQ_AppUsers_UserId
PK_資料表             → PK_TdMasterParam（主鍵）
```

### Stored Procedure（**標準命名**）

| 用途      | 規則                    | 範例                          |
| --------- | ----------------------- | ----------------------------- |
| 查詢      | `PR_[資料表]SelT[n]`    | `PR_TdMasterParamSelT1`、`PR_TdMasterParamSelT2` |
| 新增      | `PR_[資料表]ModIns`     | `PR_TdMasterParamModIns`      |
| 更新      | `PR_[資料表]ModUpd`     | `PR_TdMasterParamModUpd`      |
| 刪除（軟）| `PR_[資料表]ModDel`     | `PR_TdMasterParamModDel`      |
| 鎖定/解鎖 | `PR_[資料表]ModUpdLock` | `PR_TdInterestModUpdLock`     |
| 部分更新  | `PR_[資料表]ModUpdPart` | `PR_TdInterestModUpdPart`     |

> **舊式無 `Mod` 前綴的 SP（如 `PR_AppAuthIns` / `PR_AppAuthUpd` / `PR_AppAuthDel`）視為技術債**；新檔一律使用標準格式，舊檔不強制改名。

---

## Stored Procedure 規範

### 基本結構（查詢，取自 `PR_TdMasterParamSelT1.sql`）

```sql
USE [JEPUN_AM_CDF]
GO

IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[PR_TdMasterParamSelT1]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
DROP PROCEDURE [dbo].[PR_TdMasterParamSelT1]
GO

-- =============================================
-- Author:          Plow Chen
-- Create date:     2025/10/23
-- Description:     定存利息計算參數設定檔查詢（含篩選、分頁）
-- Modified By      Modification Date    Modification Description
-- Plow             2025/10/23           Ini
-- =============================================
CREATE PROCEDURE [dbo].[PR_TdMasterParamSelT1]
(
    @ComNo      INT,                -- 公司別代號（-1 表示全部）
    @Date       NVARCHAR(10),       -- 生效日期（"" 表示全部）
    @start      INT,                -- 起始筆數
    @length     INT,                -- 筆數
    @page       INT,                -- 頁數
    @RowCount   INT = 0 OUTPUT      -- 總筆數
)
AS
BEGIN
    SET NOCOUNT ON;

    -- 避免 Parameter Sniffing：用區域變數隔離
    DECLARE
        @ComNo_  INT,
        @Date_   NVARCHAR(10),
        @start_  INT,
        @length_ INT;

    SELECT
        @ComNo_  = @ComNo,
        @Date_   = @Date,
        @start_  = @start,
        @length_ = @length;

    BEGIN TRY
        -- 總筆數
        SELECT @RowCount = COUNT(1)
        FROM dbo.TdMasterParam WITH (NOLOCK)
        WHERE IsDel = 0
          AND (@ComNo_ = -1 OR ComNo = @ComNo_)
          AND (@Date_  = '' OR Date  = @Date_);

        -- 分頁查詢
        SELECT
            tmp.RowNo,
            com.CName,
            tmp.Cur,
            FORMAT(tmp.Date, 'yyyy/MM/dd') AS [Date],
            tmp.Period,
            tmp.LastPeriod,
            tmp.YearDays,
            tmp.TaxRound
        FROM dbo.TdMasterParam tmp WITH (NOLOCK)
        LEFT JOIN dbo.CmnCompany com WITH (NOLOCK) ON tmp.ComNo = com.ComNo
        WHERE tmp.IsDel = 0
          AND (@ComNo_ = -1 OR tmp.ComNo = @ComNo_)
          AND (@Date_  = '' OR tmp.Date  = @Date_)
        ORDER BY tmp.LogDate DESC
        OFFSET @start_ ROWS
        FETCH NEXT @length_ ROWS ONLY;
    END TRY
    BEGIN CATCH
        -- 如需回傳錯誤，請改寫成輸出 @ErrMsg 形式
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END
GO

GRANT EXEC ON [dbo].[PR_TdMasterParamSelT1] TO PUBLIC
GO

-- SP 描述
EXEC sys.sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'定存利息計算參數設定檔查詢（含篩選、分頁）',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'PROCEDURE', @level1name = N'PR_TdMasterParamSelT1';
GO
```

### 新增（`PR_[資料表]ModIns`）

慣例：透過 `MERGE` 配合「軟刪除復原」一併處理（已 `IsDel = 1` 的同鍵資料改回 `IsDel = 0` 並更新），新資料則 INSERT；用 `OUTPUT inserted.[PK]` 取回新 PK 寫入 `@RowNo`。

```sql
CREATE PROCEDURE [dbo].[PR_TdMasterParamModIns]
(
    @ComNo       INT = 1,
    @Bno         INT,
    @Cur         VARCHAR(5),
    @Date        DATE,
    @Period      NVARCHAR(10),
    @LastPeriod  NVARCHAR(10),
    @YearDays    NVARCHAR(10),
    @TaxRound    NVARCHAR(10),
    @Remark      NVARCHAR(100),
    @CreateUser  INT,
    @LogUser     INT,
    @RowNo       INT           OUTPUT,    -- 新增後的 PK
    @ErrMsg      NVARCHAR(100) OUTPUT     -- 錯誤訊息（空字串代表成功）
)
AS
DECLARE
    @LocalDate_ DATETIME = dbo.FN_GetLocalDate();

SELECT @ErrMsg = '', @RowNo = NULL;

BEGIN TRY
    -- 重複資料驗證
    IF EXISTS (SELECT 1 FROM TdMasterParam WITH (NOLOCK)
               WHERE Bno = @Bno AND Cur = @Cur AND Date = @Date AND IsDel = 0)
    BEGIN
        RAISERROR(N'相同[銀行代號]、[幣別]、[生效日期]不能存在兩筆資料，無法新增。', 16, 1);
        RETURN;
    END

    DECLARE @InsertedIDs TABLE (RowNo INT);

    MERGE INTO TdMasterParam AS Target
    USING (SELECT @Bno AS Bno, @Cur AS Cur, @Date AS Date) AS Source
       ON Target.Bno = Source.Bno AND Target.Cur = Source.Cur AND Target.Date = Source.Date
    WHEN MATCHED THEN
        UPDATE SET Target.Period      = @Period,
                   Target.LastPeriod  = @LastPeriod,
                   Target.YearDays    = @YearDays,
                   Target.TaxRound    = @TaxRound,
                   Target.Remark      = @Remark,
                   Target.LogUser     = @LogUser,
                   Target.LogDate     = @LocalDate_,
                   Target.IsDel       = 0
    WHEN NOT MATCHED THEN
        INSERT (ComNo, Bno, Cur, Date, Period, LastPeriod, YearDays, TaxRound,
                Remark, IsDel, CreateUser, CreateDate, LogUser, LogDate)
        VALUES (@ComNo, @Bno, @Cur, @Date, @Period, @LastPeriod, @YearDays, @TaxRound,
                @Remark, 0, @CreateUser, @LocalDate_, @LogUser, @LocalDate_)
        OUTPUT inserted.RowNo INTO @InsertedIDs;

    SELECT @RowNo = RowNo FROM @InsertedIDs;
END TRY
BEGIN CATCH
    SELECT @ErrMsg = ERROR_MESSAGE();
    SELECT @RowNo  = NULL;
END CATCH
GO
```

### 更新（`PR_[資料表]ModUpd`）

慣例：以 PK + `LogSN` 比對作樂觀鎖；版本不符回傳 `'CheckRowVersion'`，前端統一攔截顯示「資料已被異動，請重新查詢」。

```sql
CREATE PROCEDURE [dbo].[PR_TdMasterParamModUpd]
(
    @RowNo    INT,
    @Period   NVARCHAR(10),
    @Remark   NVARCHAR(100),
    @LogUser  INT,
    @LogSN    BIGINT,                  -- 由前端帶回 ROWVERSION
    @ErrMsg   NVARCHAR(100) OUTPUT
)
AS
SELECT @ErrMsg = '';

BEGIN TRY
    IF EXISTS (SELECT 1 FROM dbo.TdMasterParam WITH (NOLOCK)
               WHERE RowNo = @RowNo AND LogSN <> @LogSN)
    BEGIN
        RAISERROR(N'CheckRowVersion', 16, 1);
        RETURN;
    END

    UPDATE dbo.TdMasterParam
    SET Period  = @Period,
        Remark  = @Remark,
        LogUser = @LogUser,
        LogDate = dbo.FN_GetLocalDate()
    WHERE RowNo = @RowNo
      AND LogSN = @LogSN
      AND IsDel = 0;

    IF @@ROWCOUNT = 0
        SELECT @ErrMsg = N'找不到指定資料或已刪除';
END TRY
BEGIN CATCH
    SELECT @ErrMsg = ERROR_MESSAGE();
END CATCH
GO
```

### 軟刪除（`PR_[資料表]ModDel`，取自 `PR_TdMasterParamModDel.sql`）

慣例：刪除前檢查被引用情況（其他表 `RefNo = @RowNo AND IsDel = 0`），有引用就回傳訊息阻擋。

```sql
CREATE PROCEDURE [dbo].[PR_TdMasterParamModDel]
(
    @RowNo    INT,
    @LogUser  INT,
    @LogSN    BIGINT,
    @ErrMsg   NVARCHAR(100) OUTPUT
)
AS
SELECT @ErrMsg = '';

BEGIN TRY
    -- 樂觀鎖
    IF EXISTS (SELECT 1 FROM dbo.TdMasterParam WITH (NOLOCK)
               WHERE RowNo = @RowNo AND LogSN <> @LogSN)
    BEGIN
        RAISERROR(N'CheckRowVersion', 16, 1);
        RETURN;
    END

    -- 被引用檢查
    DECLARE @TableUsed NVARCHAR(100) = N'';
    IF EXISTS (SELECT 1 FROM TdInterest WITH (NOLOCK) WHERE RefNo = @RowNo AND IsDel = 0)
        SELECT @TableUsed += N'<br>定存領息檔';
    IF EXISTS (SELECT 1 FROM TdTrade WITH (NOLOCK) WHERE RefNo = @RowNo AND IsDel = 0)
        SELECT @TableUsed += N'<br>定存交易檔';

    IF @TableUsed <> ''
    BEGIN
        SELECT @ErrMsg = N'資料已被以下資料表使用，無法刪除。' + @TableUsed;
        RETURN;
    END

    -- 軟刪除（**禁止實體 DELETE**）
    UPDATE dbo.TdMasterParam
    SET IsDel   = 1,
        LogUser = @LogUser,
        LogDate = dbo.FN_GetLocalDate()
    WHERE RowNo = @RowNo
      AND LogSN = @LogSN;
END TRY
BEGIN CATCH
    SELECT @ErrMsg = ERROR_MESSAGE();
END CATCH
GO
```

---

## DAL 呼叫 SP 對應範本

DAL（`Jepun.AM.Service`）一律繼承 `BaseService`（`Jepun.Service.Base`），透過 `base.DB` 存取資料；**不使用 Dapper**。參數傳遞統一用 `Hashtable htData`；SP 名稱集中於 `SqlMapping.cs`。

```csharp
using Jepun.Service.Base;
using System.Collections;
using System.Data;

namespace Jepun.AM.Service
{
    public class TdService : BaseService, ITdService
    {
        public TdService() : base(false, "TdService") { }

        /// <summary>查詢定存利息計算參數設定檔資料（含分頁）</summary>
        public async Task<Dictionary<string, object>> GetTdMasterParamT1Async(Hashtable htData)
        {
            base.DB.ClearParams();
            base.DB.AddParamInput("ComNo",  DbType.Int32,  htData["ComNo"] ?? -1);
            base.DB.AddParamInput("Date",   DbType.String, htData["Date"]  ?? "");
            base.DB.AddParamInput("start",  DbType.Int32,  htData["start"] ?? 0);
            base.DB.AddParamInput("length", DbType.Int32,  htData["length"] ?? 0);
            base.DB.AddParamInput("page",   DbType.Int32,  htData["page"]  ?? 0);
            var rowCount = base.DB.AddParamInputOutput("RowCount", DbType.Int32, 0);

            var lists = await base.DB.ExecuteListFieldsAsync(
                SqlMapping.PR_TdMasterParamSelT1,
                CommandType.StoredProcedure).ConfigureAwait(false);

            return new Dictionary<string, object>
            {
                { "Item1", lists },
                { "Item2", rowCount.Value ?? 0 }
            };
        }

        /// <summary>新增定存利息計算參數設定檔，回傳 (RowNo, ErrMsg)</summary>
        public async Task<(string, string)> SetTdMasterParamInsAsync(Hashtable htData)
        {
            base.DB.ClearParams();
            base.DB.AddParamInput("ComNo",     DbType.Int32,    htData["ComNo"]     ?? 1);
            base.DB.AddParamInput("Bno",       DbType.Int32,    htData["Bno"]       ?? -1);
            base.DB.AddParamInput("Cur",       DbType.String,   htData["Cur"]       ?? "");
            base.DB.AddParamInput("Date",      DbType.Date,     htData["Date"]      ?? SqlMapping.DefaultDateTime);
            base.DB.AddParamInput("Period",    DbType.String,   htData["Period"]    ?? "");
            base.DB.AddParamInput("LastPeriod",DbType.String,   htData["LastPeriod"] ?? "");
            base.DB.AddParamInput("YearDays",  DbType.String,   htData["YearDays"]  ?? "");
            base.DB.AddParamInput("TaxRound",  DbType.String,   htData["TaxRound"]  ?? "");
            base.DB.AddParamInput("Remark",    DbType.String,   htData["Remark"]    ?? "");
            base.DB.AddParamInput("CreateUser",DbType.Int32,    htData["CreateUser"] ?? -1);
            base.DB.AddParamInput("LogUser",   DbType.Int32,    htData["LogUser"]   ?? -1);
            var rowNo  = base.DB.AddParamOutput("RowNo",  DbType.Int32);
            var errMsg = base.DB.AddParamOutput("ErrMsg", DbType.String, 100);

            await base.DB.ExecuteNonQueryAsync(
                SqlMapping.PR_TdMasterParamModIns,
                CommandType.StoredProcedure).ConfigureAwait(false);

            return (rowNo.Value + "", errMsg.Value + "");
        }
    }
}
```

`base.DB` 常用回傳方法：

| 用途              | 方法                                  | 回傳型別                                     |
| ----------------- | ------------------------------------- | -------------------------------------------- |
| 多筆陣列（含表頭）| `ExecuteListFieldsAsync`              | `IEnumerable<List<object>>`                  |
| 多筆字典          | `ExecuteDictionaryAsync`              | `IEnumerable<Dictionary<string, object>>`    |
| 多結果集          | `ExecuteListFieldsNextGrpcAsync`      | `IEnumerable<IEnumerable<List<object>>>`     |
| 純 OUTPUT 參數    | `ExecuteNonQueryAsync`                | `int`（取 OUTPUT 用 `.Value`）               |

> **禁止回傳 `DataTable` / `dynamic`**。

---

## 版控規範

- SP 原始檔存放於 `DB/Jepun.AM.DB/5-SP/[模組]/`（例：`5-SP/Td/PR_TdMasterParamSelT1.sql`）
- Table 原始檔存放於 `DB/Jepun.AM.DB/0-Table/[模組]/`
- ALTER 腳本（含補 `IsDel`）放 `DB/Jepun.AM.DB/2-AlterTable/`
- 每次修改 SP 需更新 .sql 檔頂部修改記錄：

```sql
-- =============================================
-- Author:          王小明
-- Create date:     2024-01-15
-- Description:     取得訂單詳細資料
-- Modified By      Modification Date    Modification Description
-- 王小明           2024/01/15           Ini
-- 李大華           2024/03/20           新增 Remark 欄位查詢
-- =============================================
```

- 修改 SP 後請同步檢查 / 更新：
  1. `Jepun.AM.Service/SqlMapping.cs`（SP 名稱常數）
  2. `Jepun.AM.Service/[模組]Service.cs`（參數加減、回傳型別）
  3. 對應 `Proto/Jepun.AM.Proto/[模組].proto`（若 RPC 介面有變）

---

## 禁止事項

- ❌ 在 SP 以外的地方執行 INSERT / UPDATE / DELETE
- ❌ SP 內使用動態 SQL（除非必要且需加防 Injection 處理）
- ❌ 在應用層做資料聚合（應在 SP 內完成）
- ❌ 實體刪除資料（一律軟刪除 `IsDel = 1`）
- ❌ 在資料表以外直接操作 View 或 Function 進行寫入
- ❌ DAL 使用 Dapper / `SqlConnection` 直接連線（一律走 `base.DB`）
