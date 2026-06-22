<template>
  <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
    <header style="border-bottom: 2px solid #41B883; padding-bottom: 10px; margin-bottom: 20px;">
      <h1 style="color: #41B883; margin-bottom: 5px;">Nuxt 3 基礎專案演練</h1>
      <nav>
        <NuxtLink to="/" style="margin-right: 15px; text-decoration: none; font-weight: bold;">首頁</NuxtLink>
        <NuxtLink to="/products" style="text-decoration: none; font-weight: bold;">產品列表</NuxtLink>
      </nav>
    </header>

    <main style="background: #f9f9f9; padding: 20px; border-radius: 8px; min-height: 200px;">
      <NuxtPage />
    </main>
  </div>
</template>