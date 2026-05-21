import { api } from '@/lib/request'
import type { UserAuthorization } from './types'

export async function getUserAuthorizations(): Promise<UserAuthorization[]> {
  const response = await api.get('/api/user/oauth-authorizations/')
  return response.data.data
}

export async function revokeUserAuthorization(clientId: string): Promise<void> {
  await api.delete(`/api/user/oauth-authorizations/${clientId}`)
}
