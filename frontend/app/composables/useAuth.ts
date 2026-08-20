import type { User, LoginResponse, MeResponse } from '~/types/auth'

const useAuthUser = () => useState<User | null>('auth_user', () => null)

export function useAuth() {
  const user = useAuthUser()
  const token = useCookie('auth_token', { maxAge: 60 * 60 * 8 })
  const { apiFetch } = useApi()

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const role = computed(() => user.value?.role ?? null)

  async function login(email: string, password: string) {
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    token.value = data.token
    user.value = data.user
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const data = await apiFetch<MeResponse>('/auth/me')
      user.value = data.user
    } catch {
      token.value = null
      user.value = null
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    role,
    login,
    logout,
    fetchUser,
  }
}
