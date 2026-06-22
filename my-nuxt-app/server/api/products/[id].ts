// server/api/products/[id].ts
export default defineEventHandler(async (event) => {
  // 1. 取得前端傳過來的動態 ID
  const id = getRouterParam(event, 'id')
  
  // 2. 從環境變數取得 .NET 10 的私有網址 (通常這是在伺服器內部網路，外網打不到)
  const config = useRuntimeConfig()
  const dotnetApiBase = config.public.apiBase || 'http://localhost:5031'

  try {
    // 3. 在 Node.js 端發送請求給 .NET 10 (這裡可以安全地附帶 ApiKey 或伺服器級別的 JWT Token)
    const data = await $fetch(`${dotnetApiBase}/api/product/${id}`, {
      headers: {
        'Authorization': 'Bearer SERVER_SECRET_TOKEN_HERE', // 機密金鑰，絕對不會外流到瀏覽器
        'X-Internal-Client': 'NuxtServer'
      }
    })

    // 4. 回傳給前端 (可以在這裡過濾掉 .NET 吐出來的敏感欄位，例如隱私 Log 或資料庫 ID)
    return data
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '後端金融核心系統連線失敗'
    })
  }
})