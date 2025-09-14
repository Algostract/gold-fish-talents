export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()

  if (loggedIn.value && user.value?.isProfileComplete) {
    return navigateTo('/talents/models/dashboard')
  }
})
