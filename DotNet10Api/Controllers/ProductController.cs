using Microsoft.AspNetCore.Mvc;

namespace DotNet10Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    // 🛡️ 安全 Token 驗證機制
    private bool IsValidToken() => Request.Headers["Authorization"].ToString() == "Bearer SERVER_SECRET_TOKEN_HERE";

    // 💡 優化：加上 static readonly 讓資料在記憶體中只有一份（模擬虛擬資料庫狀態）
    private static readonly List<Dictionary<string, object>> _productsDb = new()
    {
        new() { { "id", "1001" }, { "name", "精選海外債券商品 A" }, { "price", 105.25 } },
        new() { { "id", "1002" }, { "name", "高收益平衡基金 B" }, { "price", 98.50 } },
        new() { { "id", "1003" }, { "name", "永續 ESG 科技 ETF" }, { "price", 25.15 } },
        new() { { "id", "1004" }, { "name", "抗通膨黃金連動結構商品" }, { "price", 210.00 } }
    };

    // 💡 獲取產品清單 API
    [HttpGet]
    public IActionResult GetProducts()
    {
        if (!IsValidToken()) return Unauthorized(new { Message = "非法存取：未通過安全驗證" });
        return Ok(_productsDb);
    }

    // 💡 獲取單一產品詳細規格 API
    [HttpGet("{id}")]
    public IActionResult GetProduct(string id)
    {
        if (!IsValidToken()) return Unauthorized(new { Message = "非法存取：未通過安全驗證" });

        // 使用你的 LINQ 查詢，效率與邏輯非常好
        var product = _productsDb.FirstOrDefault(d => d["Id"].ToString() == id);
        if (product == null) return NotFound(new { Message = "產品不存在" });

        return Ok(product);
    }
}