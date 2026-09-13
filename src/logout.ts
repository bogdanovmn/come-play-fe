import { SsoService } from '@bogdanovmn/ssofw'
import { authStore } from '@/stores/auth'

export async function logout(ssoService: SsoService): Promise<void> {
    const auth = authStore()
    await ssoService.deleteRefreshToken()
    auth.update()
}