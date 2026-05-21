import { createFileRoute } from '@tanstack/react-router'
import { OAuthAuthorizePage } from '@/features/oauth-authorize'

export const Route = createFileRoute('/_authenticated/oauth2/authorize')({
  component: OAuthAuthorizePage,
})
