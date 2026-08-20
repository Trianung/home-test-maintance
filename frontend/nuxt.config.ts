export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  modules: ['@nuxt/icon'],

  runtimeConfig: {
    // Server-side only (dipakai saat SSR di dalam Docker → pakai nama service)
    apiBaseServer:
      process.env.NUXT_API_BASE_SERVER ||
      'http://localhost:3001/api',

    public: {
      // Client-side (dipakai di browser → harus pakai localhost atau domain publik)
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        'http://localhost:3001/api',
    },
  },

  css: ['~/assets/css/main.css'],
})