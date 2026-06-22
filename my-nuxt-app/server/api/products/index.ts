// server/api/products/index.ts
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const dotnetApiBase = config.public.apiBase || 'http://localhost:5031'

    try {
        // 秘密呼叫 .NET 10 的 api/product 獲取整張清單
        const data = await $fetch(`${dotnetApiBase}/api/product`, {
            headers: {
                'Authorization': 'Bearer SERVER_SECRET_TOKEN_HERE'
            }
        })
        return data
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: '無法取得後端商品列表資料'
        })
    }
})