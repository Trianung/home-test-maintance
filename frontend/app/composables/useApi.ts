export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

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

    return await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
      method: (options.method || 'GET') as any,
      headers,
      body: options.body ? options.body : undefined,
      query: options.query,
    })
  }

  return { apiFetch }
}
