import { api } from '@/lib/request'
import type {
  OAuthAuthorizeData,
  OAuthAuthorizeRequest,
  OAuthAuthorizeResponse,
} from './types'

export async function getOAuthAuthorizeData(
  params: URLSearchParams
): Promise<OAuthAuthorizeData> {
  const response = await api.get(`/api/oauth2/authorize?${params.toString()}`)
  return response.data.data
}

export async function submitOAuthAuthorize(
  data: OAuthAuthorizeRequest
): Promise<OAuthAuthorizeResponse> {
  const response = await api.post('/api/oauth2/authorize', data)
  return response.data
}
