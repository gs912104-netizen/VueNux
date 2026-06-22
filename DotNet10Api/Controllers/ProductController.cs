using Microsoft.AspNetCore.Mvc;

namespace DotNet10Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    [HttpGet("{id}")]
    public IActionResult GetProduct(string id)
    {
        // 🛡️ 安全檢查：檢查 Header 是否帶有來自 Nuxt 伺服器的秘密 Token
        var token = Request.Headers["Authorization"].ToString();
        if (token != "Bearer SERVER_SECRET_TOKEN_HERE")
        {
            return Unauthorized(new { Message = "非法存取：未通過安全驗證" });
        }

        // 驗證成功，傳回核心資料
        return Ok(new 
        {
            Id = id,
            Name = $"安全防護 - 精選商品 {id}",
            Price = 105.25,
            UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
        });
    }
}