// Program.cs
var builder = WebApplication.CreateBuilder(args);

// 💡 調整這裡：強制讓所有的 Dictionary 或 Object 在轉成 JSON 時自動變成小寫開頭
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase; // 針對 Dictionary 關鍵
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ==================== 2. 配置 Swagger 中間件 ====================
// 建議只在開發環境 (Development) 開啟 Swagger，避免生產環境暴露 API 結構
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();   // 啟用 JSON 格式的 API 規格文件
    app.UseSwaggerUI(); // 啟用可視化的網頁 UI 介面 (預設網址為 /swagger)
}

app.UseCors("NuxtPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();