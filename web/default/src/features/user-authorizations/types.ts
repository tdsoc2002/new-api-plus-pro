import { z } from 'zod'

export const userAuthorizationSchema = z.object({
  client_id: z.string(),
  client_name: z.string(),
  scopes: z.string(),
  created_at: z.string(),
})

export type UserAuthorization = z.infer<typeof userAuthorizationSchema>
