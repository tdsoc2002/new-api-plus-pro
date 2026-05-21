import { z } from 'zod'

export const oauthClientSchema = z.object({
  id: z.number(),
  client_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  redirect_uris: z.string(),
  scopes: z.string(),
  enabled: z.boolean(),
  require_https: z.boolean(),
  user_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type OAuthClient = z.infer<typeof oauthClientSchema>

export interface GetOAuthClientsParams {
  p?: number
  page_size?: number
}

export interface OAuthClientFormData {
  name: string
  description?: string
  redirect_uris: string
  scopes?: string
  require_https?: boolean
}
