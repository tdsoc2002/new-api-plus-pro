import { createFileRoute } from '@tanstack/react-router'
import { UserAuthorizationsPage } from '@/features/user-authorizations'

export const Route = createFileRoute('/_authenticated/oauth-authorizations/')({
  component: UserAuthorizationsPage,
})
