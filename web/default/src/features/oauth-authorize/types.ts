export interface OAuthAuthorizeData {
  client_id: string
  client_name: string
  client_description: string
  redirect_uri: string
  scope: string
  state: string
  code_challenge?: string
  code_challenge_method?: string
}

export interface OAuthAuthorizeRequest {
  client_id: string
  redirect_uri: string
  scope: string
  state: string
  code_challenge?: string
  code_challenge_method?: string
  approved: boolean
}

export interface OAuthAuthorizeResponse {
  success: boolean
  redirect_url: string
}
