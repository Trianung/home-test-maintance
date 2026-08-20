export default defineNuxtRouteMiddleware(() => {
  const { role } = useAuth()

  if (role.value !== 'admin') {
    return navigateTo('/dashboard')
  }
})
