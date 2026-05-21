import { api } from '@/lib/api'
import type { OAuthClient, GetOAuthClientsParams, OAuthClientFormData } from './types'

export async function getOAuthClients(
  params: GetOAuthClientsParams = {}
): Promise<{ success: boolean; data?: OAuthClient[] }> {
  const res = await api.get('/api/oauth-clients/')
  return res.data
}

export async function getOAuthClient(
  id: number
): Promise<{ success: boolean; data?: OAuthClient }> {
  const res = await api.get(`/api/oauth-clients/${id}`)
  return res.data
}

export async function createOAuthClient(
  data: OAuthClientFormData
): Promise<{ success: boolean; data?: OAuthClient; client_secret?: string }> {
  const res = await api.post('/api/oauth-clients/', data)
  return res.data
}

export async function updateOAuthClient(
  data: OAuthClientFormData & { id: number }
): Promise<{ success: boolean; data?: OAuthClient }> {
  const { id, ...updateData } = data
  const res = await api.put(`/api/oauth-clients/${id}`, updateData)
  return res.data
}

export async function deleteOAuthClient(id: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/api/oauth-clients/${id}`)
  return res.data
}

export async function regenerateClientSecret(
  id: number
): Promise<{ success: boolean; client_secret?: string }> {
  const res = await api.post(`/api/oauth-clients/${id}/regenerate-secret`)
  return res.data
}
