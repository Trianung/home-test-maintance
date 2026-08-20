export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user, fetchUser } = useAuth()

  if (!token.value) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
    return
  }

  if (!user.value) {
    await fetchUser()
  }

  if (!user.value) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
    return
  }

  if (to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
