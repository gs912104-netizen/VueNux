var builder = WebApplication.CreateBuilder(args);

// ==================== 1. 註冊 Swagger 服務 ====================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer(); // 讓系統能掃描 API 節點
builder.Services.AddSwaggerGen();           // 生成 Swagger 文件產生器

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