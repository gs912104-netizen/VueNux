# gRPC 合約規範文件

## 基本規則

1. Proto 檔案統一放在 `Proto/Jepun.AM.Proto/` 資料夾（獨立專案，Web 與 Grpc 皆以 `ProjectReference` 引用）
2. 一個模組對應一個 `.proto` 檔案
3. Proto 修改必須**向下相容**，禁止刪除或變更既有欄位編號
4. **本專案統一使用 `common.proto` 的通用 Message** 作為 Request / Reply（`DictionaryObj`、`StringObj`、`BytesObj`…），不為每個 RPC 客製 Request / Reply 類別
5. MVC 層透過自動產生的 **gRPC Client** 呼叫，封裝於 `Web/Jepun.AM.Web/Common/Bulkhead/GrpcBulkhead.cs`；上層 Controller 統一透過 `IServiceHelper`，禁止繞過

---

## Proto 檔案規範

### 命名規則

| 項目             | 規則                                                                             | 範例                            |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| 檔案名稱         | `[模組].proto`                                                                   | `Td.proto`、`App.proto`         |
| Package          | `[模組]`                                                                         | `package Td;`                   |
| C# Namespace     | `Jepun.AM.Grpc`（**所有 proto 統一**）                                           | `option csharp_namespace = "Jepun.AM.Grpc";` |
| Service 名稱     | `[模組]`                                                                         | `service Td`                    |
| Message 名稱     | PascalCase（**多採用 common.proto 通用型別，鮮少自定**）                         | `DictionaryObj`、`StringObj`    |
| 欄位名稱         | snake_case（產生 C# 後自動轉 PascalCase）                                        | `customer_id`、`file_name`      |
| RPC：查詢        | `Get[資源]T[n]`（與 SP `PR_[Table]SelT[n]` 對齊）                                | `GetTdMasterParamT1`            |
| RPC：異動        | `Set[資源][動作]`（`Ins`/`Upd`/`Del`/`UpdLock`/`UpdPart`）                       | `SetTdMasterParamIns`           |

### Request / Reply 約定（**本專案實際慣例**）

- **Request**：一律使用 `common.DictionaryObj`（`map<string, string> data` 承載前端表單欄位）
- **Reply**：一律使用 `common.StringObj`（`val` 帶 JSON 字串，`err` 帶錯誤訊息）
- 例外：檔案上傳/下載用 `BytesObj` / `BytesValObj`；少數需要明確型別的數值回傳用 `IntObj` / `LongObj` / `BoolObj` 等

> 為什麼不為每個 RPC 客製 Request / Reply？此專案 SP 入參皆走「key/value 字典」，回傳資料以 JSON 序列化傳輸，集中型別可大幅降低 Proto 與 DAL 異動的連動成本。新增 RPC 時請沿用此模式，**不要**為單一方法新增 `XxxRequest` / `XxxReply`。

---

## Proto 範本

### `[模組].proto`（取自 `Proto/Jepun.AM.Proto/Td.proto`）

```proto
syntax = "proto3";
import "common.proto";
option csharp_namespace = "Jepun.AM.Grpc";

package Td;

// 定存模組
service Td {
  // 定存利息計算參數設定檔
  rpc GetTdMasterParamT1(common.DictionaryObj) returns (common.StringObj);
  rpc GetTdMasterParamT2(common.DictionaryObj) returns (common.StringObj);
  rpc GetTdMasterParamT3(common.DictionaryObj) returns (common.StringObj);

  rpc SetTdMasterParamIns(common.DictionaryObj) returns (common.StringObj);
  rpc SetTdMasterParamUpd(common.DictionaryObj) returns (common.StringObj);
  rpc SetTdMasterParamDel(common.DictionaryObj) returns (common.StringObj);

  // 定存交易
  rpc GetTdTradeT1(common.DictionaryObj) returns (common.StringObj);
  rpc SetTdTradeIns(common.DictionaryObj) returns (common.StringObj);
  rpc SetTdTradeUpd(common.DictionaryObj) returns (common.StringObj);
  rpc SetTdTradeDel(common.DictionaryObj) returns (common.StringObj);
  rpc SetTdTradeUpdLock(common.DictionaryObj) returns (common.StringObj);
}
```

### `common.proto`（共用型別，**請勿任意改動**）

```proto
syntax = "proto3";
import "google/protobuf/struct.proto";
import "google/protobuf/duration.proto";
import "google/protobuf/timestamp.proto";
import "google/protobuf/wrappers.proto";
package common;

// 狀態碼列舉
enum StatusCode {
  SUCCESS = 0;
  FAILED = 1;
  NOT_FOUND = 2;
  VALIDATION_ERROR = 3;
  UNAUTHORIZED = 4;
  INTERNAL_ERROR = 5;
  NONE = 6;
}

// 注意：純量值一律具預設值且無法設為 null（string 預設為 ""、ByteString 預設為空位元組）。

// {Data:{key1:value1,...},Err:""}
// 對應 Hashtable / Dictionary<string, string> 入參
message DictionaryObj {
    map<string, string> data = 1;
    string err = 2;
}

// 對應 IEnumerable<Dictionary<string, string>>（ExecuteGrpcDictionaryAsync）
message ListDictionaryObj {
    repeated DictionaryObj data = 1;
    string err = 2;
}

// 對應 IEnumerable<string>（ExecuteListAsync<string>）
message ListObj {
    repeated string data = 1;
    string err = 2;
}

// 對應 IEnumerable<List<string>>（ExecuteListGrpcAsync / ExecuteListFieldsAsync）
message ListListObj {
    repeated ListObj data = 1;
    string err = 2;
}

// 對應 IEnumerable<IEnumerable<List<string>>>（ExecuteListFieldsNextGrpcAsync）
message ListListListObj {
    repeated ListListObj data = 1;
    string err = 2;
}

/* 建議用 StringObj 取代，效能較佳 */
message JsonStrObj {
    google.protobuf.Value data = 1;
    string err = 2;
}

message DoubleObj    { double val = 1; string err = 2; }
message DoubleValObj { google.protobuf.DoubleValue val = 1; string err = 2; }
message FloatObj     { float  val = 1; string err = 2; }
message FloatValObj  { google.protobuf.FloatValue  val = 1; string err = 2; }
message IntObj       { int32  val = 1; string err = 2; }
message IntValObj    { google.protobuf.Int32Value  val = 1; string err = 2; }
message LongObj      { int64  val = 1; string err = 2; }
message LongValObj   { google.protobuf.Int64Value  val = 1; string err = 2; }

/* Example: 12345.6789 → { units = 12345, nanos = 678900000 } */
message DecimalObj {
    int64    units = 1;
    sfixed32 nanos = 2;
    string   err   = 3;
}

message BoolObj      { bool   val = 1; string err = 2; }
message BoolValObj   { google.protobuf.BoolValue val = 1; string err = 2; }

/* 本專案 Reply 預設型別：val 帶 JSON 字串 */
message StringObj    { string val = 1; string err = 2; }
message StringValObj { google.protobuf.StringValue val = 1; string err = 2; }

/* 檔案上傳 / 下載 */
message BytesObj {
    bytes  val         = 1;
    string contentType = 2;
    string name        = 3;
    map<string, string> data = 4;
    string err         = 5;
}
message BytesValObj {
    google.protobuf.BytesValue val = 1;
    string contentType = 2;
    string name        = 3;
    map<string, string> data = 4;
    string err         = 5;
}

message DictionaryByteObj {
    map<string, bytes>  val  = 1;
    map<string, string> data = 2;
    string err = 3;
}

/* UTC 時間（DateTime/DateTimeOffset，Kind 為 Utc） */
message DateTimeObj { google.protobuf.Timestamp val = 1; string err = 2; }
message TimeSpanObj { google.protobuf.Duration  val = 1; string err = 2; }

message UploadFileRequest  { FileMetadata metadata = 1; bytes data = 2; }
message FileMetadata       { string file_name = 1; }
message UploadFileResponse { string id = 1; }

/* gRPC 物件有效載荷（特殊跨模組情境使用） */
message GrpcPayload {
    StatusCode code = 1;
    google.protobuf.StringValue message = 2;
    map<string, google.protobuf.StringValue> args     = 3;
    map<string, google.protobuf.StringValue> hts      = 4;
    map<string, bytes>                       contents = 5;
    map<string, google.protobuf.StringValue> models   = 6;
    google.protobuf.StringValue              data     = 7;
    google.protobuf.BytesValue               rawData  = 8;
}
```

---

## gRPC Service 實作規範（Server 端）

### 類別結構

- 類別命名 `[模組]Grpc`（**非** `XxxGrpcService`），檔案放 `Grpc/Jepun.AM.Grpc/Services/[模組]Grpc.cs`
- 繼承自 Proto 產生的 `[模組].[模組]Base`
- 注入 `BaseService`（設定服務名/Log）與對應 DAL `I[模組]Service`
- 入參用 `DictionaryObj`，呼叫 `request.ToHashtable()` 轉為 `Hashtable` 後丟給 DAL
- 回傳統一包裝為 `StringObj`：成功將資料 `ObjToJson()` 放 `Val`；失敗將訊息放 `Err`，**不要 throw `RpcException`**（前端統一檢查 `Err`）

### 範本（取自 `Grpc/Jepun.AM.Grpc/Services/TdGrpc.cs`）

```csharp
using Common;
using Grpc.Core;
using Jepun.AM.Service;
using Jepun.Core.Common;
using Jepun.Service.Base;

namespace Jepun.AM.Grpc
{
    public class TdGrpc : Td.TdBase
    {
        private readonly ITdService _tdService;

        public TdGrpc(BaseService baseService, ITdService tdService)
        {
            baseService.EnableLog  = false;
            baseService.ServiceName = "TdGrpc";
            _tdService = tdService;
        }

        /// <summary>查詢定存利息計算參數設定檔（含分頁）</summary>
        public override async Task<StringObj> GetTdMasterParamT1(DictionaryObj request, ServerCallContext context)
        {
            var result = new StringObj();
            try
            {
                var data = await _tdService.GetTdMasterParamT1Async(request.ToHashtable())
                                           .ConfigureAwait(false);
                result.Val = data?.ObjToJson();
            }
            catch (Exception ex)
            {
                result.Err = ex.Message;
            }
            return result;
        }

        /// <summary>新增定存利息計算參數設定檔</summary>
        public override async Task<StringObj> SetTdMasterParamIns(DictionaryObj request, ServerCallContext context)
        {
            var result = new StringObj();
            try
            {
                var (rowNo, errMsg) = await _tdService.SetTdMasterParamInsAsync(request.ToHashtable())
                                                      .ConfigureAwait(false);
                result.Val = rowNo;
                result.Err = errMsg;
            }
            catch (Exception ex)
            {
                result.Err = ex.Message;
            }
            return result;
        }
    }
}
```

### 錯誤回傳慣例

- **業務錯誤**（驗證失敗、樂觀鎖、資料不存在等）→ 透過 `StringObj.Err` 回傳訊息，**不 throw**
- **系統例外**（DB 連線失敗、未預期錯誤）→ `catch` 後放 `StringObj.Err = ex.Message`
- 當需要明確 HTTP 對應的狀態語意時才使用 `RpcException`（極少數情境）：

| 情境           | gRPC `StatusCode`    |
| -------------- | -------------------- |
| 找不到資料     | `NotFound`           |
| 參數驗證失敗   | `InvalidArgument`    |
| 未授權         | `Unauthenticated`    |
| 權限不足       | `PermissionDenied`   |
| 系統內部錯誤   | `Internal`           |
| 資源已存在     | `AlreadyExists`      |

---

## MVC 呼叫 gRPC Client 規範（Client 端）

### 整體流程

```
Controller (Td/TdMasterParamOverviewController)
    └→ IServiceHelper.GetTdMasterParamT1Async(ViewModel)
        └→ GrpcBulkhead.GetTdMasterParamT1Async(Hashtable)
            └→ new Td.TdClient(getGrpcAccess())
                └→ client.GetTdMasterParamT1Async(htable.ToDictionaryObj())
                    └→ Server: TdGrpc.GetTdMasterParamT1
```

- **Controller 不直接持有 gRPC Client**；只依賴 `IServiceHelper`
- `ServiceHelper` 呼叫 `GrpcBulkhead.[Method]Async`（靜態方法），負責 gRPC Client 建立、Polly Retry、JSON 反序列化、回傳 `Result<T, string>`
- gRPC 連線位址由 `JepunConfig.json` 提供（非 `appsettings.json` 的 `GrpcService:Address`），透過 `getGrpcAccess()` 取得 Channel

### Bulkhead 範本（`Common/Bulkhead/GrpcBulkhead.cs`）

```csharp
public static async Task<Result<Dictionary<string, object>, string>> GetTdMasterParamT1Async(Hashtable htable)
{
    try
    {
        var client = new Td.TdClient(getGrpcAccess());

        var response = await PollyHelper.WaitAndRetryAsync(
            async _ => await client.GetTdMasterParamT1Async(htable.ToDictionaryObj()),
            pollyRetryCount, 200, "GetTdMasterParamT1Async").ConfigureAwait(false);

        return string.IsNullOrEmpty(response.Err)
            ? Result<Dictionary<string, object>, string>.Ok(response.Val.JsonToObj<Dictionary<string, object>>())
            : Result<Dictionary<string, object>, string>.Err(response.Err);
    }
    catch (Exception ex)
    {
        return Result<Dictionary<string, object>, string>.Err(ex.Message);
    }
}
```

### Controller 使用範例（`Controllers/Td/TdMasterParamOverviewController.cs`）

```csharp
[WindowsAuthorizeFilter]
public class TdMasterParamOverviewController : BaseWebController
{
    private readonly IServiceHelper _serviceHelper;

    public TdMasterParamOverviewController(IServiceHelper serviceHelper)
        : base("TdMasterParamOverviewController")
    {
        _serviceHelper = serviceHelper;
    }

    /// <summary>查詢資料（含分頁）</summary>
    public async Task<string> GetTdMasterParamT1(TdMasterParamOverviewViewModel model)
    {
        Dictionary<string, string> innerArgs = [];

        var retVal = await _serviceHelper.GetTdMasterParamT1Async(model).ConfigureAwait(false);
        if (!retVal.IsOk)
        {
            BootstrapAlert(Label.Error, ResourceAdapter.GetResourceString(typeof(Err), retVal.GetErr), "danger");
            return JQuery.ToString();
        }

        innerArgs.Add("data", retVal.GetOk.ObjToJson());
        innerArgs.Add("page", model?.page + "");
        FormFireHandler("GetTdMasterParamT1", innerArgs);
        return JQuery.ToString();
    }
}
```

---

## Proto 版本管理規範

### 向下相容原則（Breaking Change 禁止）

```proto
// ❌ 禁止：刪除既有欄位或變更欄位編號
message MyReply {
  // string val = 1;  ← 不可刪除既有欄位
  // string err = 2;  ← 不可變更欄位編號
}

// ✅ 正確：新增欄位使用新的編號
message MyReply {
  string val      = 1;
  string err      = 2;
  string trace_id = 3;  // ← 新增欄位
}

// ❌ 禁止：刪除既有 RPC，或改名（會破壞既有 Client）
// 改名請新增一個 RPC，舊的標記 deprecated 直到所有呼叫端遷移完成
service Td {
  rpc GetTdMasterParamT1(common.DictionaryObj) returns (common.StringObj);
  rpc GetTdMasterParamT2(common.DictionaryObj) returns (common.StringObj);  // 新增
}
```

### .proto 檔案版控

- `.proto` 修改建議在檔頂以註解保留變更記錄
- `Proto/Jepun.AM.Proto` 為共享專案，**Web 與 Grpc 共用同一份 proto**（透過 `ProjectReference`），不會有 Client/Server 不同步問題
- 修改 proto 後務必同步檢查：
  1. `Grpc/Jepun.AM.Grpc/Services/[模組]Grpc.cs`（Server 實作）
  2. `Web/Jepun.AM.Web/Common/Bulkhead/GrpcBulkhead.cs`（Client 呼叫）
  3. `Web/Jepun.AM.Web/Common/ServiceHelper.cs`（業務介面）

---

## 專案設定

本專案 Proto 採「**獨立共享專案**」設計，與一般 gRPC 教學範例不同：

### Proto 專案（`Proto/Jepun.AM.Proto/Jepun.AM.Proto.csproj`）

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Grpc.AspNetCore" Version="2.53.0" />
  </ItemGroup>

  <ItemGroup>
    <!-- 預設同時產生 Server + Client，給 Web 與 Grpc 共用 -->
    <Protobuf Include="common.proto" />
    <Protobuf Include="Td.proto" />
    <Protobuf Include="App.proto" />
    <!-- ... 其餘模組 ... -->
  </ItemGroup>
</Project>
```

### Server 專案（`Grpc/Jepun.AM.Grpc/Jepun.AM.Grpc.csproj`）

```xml
<ItemGroup>
  <PackageReference Include="Grpc.AspNetCore" Version="2.53.0" />
  <PackageReference Include="Grpc.AspNetCore.Server.Reflection" Version="2.53.0" />
  <PackageReference Include="Microsoft.Data.SqlClient" Version="6.0.2" />
  <PackageReference Include="Polly" Version="8.3.1" />
</ItemGroup>

<ItemGroup>
  <ProjectReference Include="..\..\Proto\Jepun.AM.Proto\Jepun.AM.Proto.csproj" />
  <ProjectReference Include="..\..\Jepun.AM.Service\Jepun.AM.Service.csproj" />
</ItemGroup>
```

### Client 專案（`Web/Jepun.AM.Web/Jepun.AM.Web.csproj`）

```xml
<ItemGroup>
  <PackageReference Include="Grpc.AspNetCore" Version="2.53.0" />
</ItemGroup>

<ItemGroup>
  <ProjectReference Include="..\..\Proto\Jepun.AM.Proto\Jepun.AM.Proto.csproj" />
</ItemGroup>
```

> Client 端**不使用** `builder.Services.AddGrpcClient<...>()` 的 DI 模式；改以 `GrpcBulkhead` 內 `new Td.TdClient(getGrpcAccess())` 直接建立。連線位址、憑證、Polly 重試參數皆由 `JepunConfig.json` 設定。
