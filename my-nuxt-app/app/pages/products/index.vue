<!--<template>
    <div>
        <h2>📦 產品列表頁面</h2>
        <p>點擊下方產品，測試「動態路由」傳參：</p>
        <ul>
            <li><NuxtLink to="/products/1001">產品 A (ID: 1001)</NuxtLink></li>
            <li><NuxtLink to="/products/1002">產品 B (ID: 1002)</NuxtLink></li>
        </ul>
    </div>
</template>-->

<template>
    <div>
        <h2>📦 產品列表頁面 (.NET 10 聯動版)</h2>
        <p>點擊下方產品，測試「動態路由」與後端 API 串接：</p>

        <div v-if="pending">正在向伺服器請求最新商品報價...</div>

        <div v-else-if="error" style="color: red;">載入失敗：{{ error.message }}</div>

        <ul v-else>
            <li v-for="item in products" :key="item.id" style="margin-bottom: 10px;">
                <NuxtLink :to="`/products/${item.id}`">
                    <strong style="color: #41B883;">{{ item.name }}</strong>
                    (ID: {{ item.id }}) - 當前淨值: ${{ item.price }}
                </NuxtLink>
            </li>
        </ul>

        <br />
        <NuxtLink to="/">⬅️ 返回首頁</NuxtLink>
    </div>
</template>

<script setup>// 呼叫同網域的 Nuxt BFF 代理接口
// useFetch 在 SSR 階段（首次進網頁）會在 Node 端跑，SPA 階段（換頁）會在瀏覽器跑，效能極佳。
const { data: products, pending, error } = await useFetch('/api/products', {
  lazy: true
})</script>