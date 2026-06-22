<template>
    <div>
        <h2>🔍 安全串接驗證頁面</h2>

        <div v-if="pending">正在透過安全網閘讀取資料...</div>
        <div v-else-if="error" style="color: red;">讀取失敗：{{ error.message }}</div>

        <div v-else-if="product" style="background: #eef9f4; padding: 15px; border-radius: 4px;">
            <p>商品編號: <strong>{{ product.id }}</strong></p>
            <p>商品名稱: <strong>{{ product.name }}</strong></p>
            <p>商品價格: <strong>${{ product.price }}</strong></p>
        </div>

        <br />
        <NuxtLink to="/products">⬅️ 返回列表</NuxtLink>
    </div>
</template>

<script setup>
import { computed } from 'vue'
const route = useRoute()
const productId = computed(() => route.params.id)

// 💡 改變這裡：網址寫相對路徑 '/api/products/...'
// 這樣在瀏覽器的 Network 面板裡，永遠只會看到呼叫 localhost:3000，後端的 5000 埠口與金鑰被完美隱藏！
const { data: product, pending, error } = await useFetch(() => `/api/products/${productId.value}`, {
  lazy: true
})
</script>