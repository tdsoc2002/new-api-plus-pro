import { SectionPageLayout } from '@/components/layout/components/section-page-layout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { OAuthClientsProvider, useOAuthClients } from './components/oauth-clients-provider'
import { OAuthClientsTable } from './components/oauth-clients-table'
import { OAuthClientsMutateDrawer } from './components/oauth-clients-mutate-drawer'
import { OAuthClientsDeleteDialog } from './components/oauth-clients-delete-dialog'
import { OAuthClientsSecretDialog } from './components/oauth-clients-secret-dialog'
import { useTranslation } from 'react-i18next'

function OAuthClientsPrimaryButtons() {
  const { t } = useTranslation()
  const { setMutateDrawerOpen } = useOAuthClients()

  return (
    <Button onClick={() => setMutateDrawerOpen(true)}>
      <Plus className='mr-2 h-4 w-4' />
      {t('Create Application')}
    </Button>
  )
}

function OAuthClientsContent() {
  const { t } = useTranslation()

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('OAuth Applications')}</SectionPageLayout.Title>
      <SectionPageLayout.Description>
        {t('Manage OAuth 2.0 applications that can access user accounts')}
      </SectionPageLayout.Description>
      <SectionPageLayout.Actions>
        <OAuthClientsPrimaryButtons />
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <OAuthClientsTable />
      </SectionPageLayout.Content>

      <OAuthClientsMutateDrawer />
      <OAuthClientsDeleteDialog />
      <OAuthClientsSecretDialog />
    </SectionPageLayout>
  )
}

export function OAuthClients() {
  return (
    <OAuthClientsProvider>
      <OAuthClientsContent />
    </OAuthClientsProvider>
  )
}
