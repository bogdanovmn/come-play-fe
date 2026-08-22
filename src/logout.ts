export function logout(ssoService: { deleteRefreshToken: () => Promise<void> }): void {
    const { authStore } = require('@/stores/auth')
    const auth = authStore()
    ssoService.deleteRefreshToken()
        .finally(() => { auth.update() })
}
