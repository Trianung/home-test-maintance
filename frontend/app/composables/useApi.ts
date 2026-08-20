export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  // Gunakan apiBaseServer saat di server-side (SSR dalam Docker),
  // gunakan apiBase saat di client-side (browser)
  const baseUrl = import.meta.server
    ? (config.apiBaseServer as string) || config.public.apiBase
    : config.public.apiBase

  async function apiFetch<T>(
    endpoint: string,
    options: {
      method?: string
      body?: unknown
      query?: Record<string, string>
    } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {}

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    return await $fetch<T>(`${baseUrl}${endpoint}`, {
      method: (options.method || 'GET') as any,
      headers,
      body: options.body ? options.body : undefined,
      query: options.query,
    })
  }

  return { apiFetch }
}
