import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { tokenStorage } from '@bogdanovmn/ssofw'

const apiUrl = import.meta.env.VITE_API_URL

export const makeApiRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  params: Record<string, unknown> = {}
): Promise<T> => {
  const response = await axios({
    method,
    url: `${apiUrl}${url}`,
    params: method === 'get' ? params : undefined,
    data: method !== 'get' ? params : undefined,
  })
  return response.data as T
}

class AuthHttpClient {
  private client: AxiosInstance
  private onAuthFailed: () => void

  constructor(onAuthFailed: () => void) {
    this.client = axios.create({ baseURL: apiUrl })
    this.onAuthFailed = onAuthFailed

    this.client.interceptors.request.use((config) => {
      const token = tokenStorage.accessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await tokenStorage.refreshAccessToken()
            const token = tokenStorage.accessToken()
            error.config.headers.Authorization = `Bearer ${token}`
            return this.client.request(error.config)
          } catch {
            this.onAuthFailed()
            return Promise.reject(error)
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, params: Record<string, unknown> = {}): Promise<T> {
    const response = await this.client.get<T>(url, { params })
    return response.data
  }

  async post<T>(url: string, data: Record<string, unknown> = {}): Promise<T> {
    const response = await this.client.post<T>(url, data)
    return response.data
  }

  async put<T>(url: string, data: Record<string, unknown> = {}): Promise<T> {
    const response = await this.client.put<T>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url)
    return response.data
  }
}

let authApiInstance: AuthHttpClient | null = null

export function createAuthApi(): AuthHttpClient {
  if (!authApiInstance) {
    authApiInstance = new AuthHttpClient(() => {
      const { authStore } = require('@/stores/auth')
      const auth = authStore()
      auth.update()
    })
  }
  return authApiInstance
}

export const authApi = {
  get: <T>(url: string, params?: Record<string, unknown>) => createAuthApi().get<T>(url, params),
  post: <T>(url: string, data?: Record<string, unknown>) => createAuthApi().post<T>(url, data),
  put: <T>(url: string, data?: Record<string, unknown>) => createAuthApi().put<T>(url, data),
  delete: <T>(url: string) => createAuthApi().delete<T>(url),
}
