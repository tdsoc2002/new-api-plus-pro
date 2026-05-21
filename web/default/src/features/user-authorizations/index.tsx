import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, Shield, Trash2, Info } from 'lucide-react'
import { getUserAuthorizations, revokeUserAuthorization } from './api'
import type { UserAuthorization } from './types'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function UserAuthorizationsPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [authorizations, setAuthorizations] = useState<UserAuthorization[]>([])
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [selectedAuth, setSelectedAuth] = useState<UserAuthorization | null>(null)
  const [revoking, setRevoking] = useState(false)

  const fetchAuthorizations = async () => {
    try {
      setLoading(true)
      const data = await getUserAuthorizations()
      setAuthorizations(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Failed to load authorizations'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuthorizations()
  }, [])

  const handleRevokeClick = (auth: UserAuthorization) => {
    setSelectedAuth(auth)
    setRevokeDialogOpen(true)
  }

  const handleRevokeConfirm = async () => {
    if (!selectedAuth) return

    try {
      setRevoking(true)
      await revokeUserAuthorization(selectedAuth.client_id)
      toast.success(t('Authorization revoked successfully'))
      setRevokeDialogOpen(false)
      setSelectedAuth(null)
      fetchAuthorizations()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Failed to revoke authorization'))
    } finally {
      setRevoking(false)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='mx-auto h-8 w-8 animate-spin text-primary' />
          <p className='mt-4 text-sm text-muted-foreground'>{t('Loading...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='container max-w-4xl py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>{t('OAuth Authorizations')}</h1>
        <p className='mt-2 text-muted-foreground'>
          {t('Manage applications that have access to your account')}
        </p>
      </div>

      {authorizations.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Shield className='h-12 w-12 text-muted-foreground' />
            <p className='mt-4 text-center text-muted-foreground'>
              {t('You have not authorized any applications yet')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert className='mb-6'>
            <Info className='h-4 w-4' />
            <AlertDescription>
              {t('Revoking authorization will immediately revoke all access tokens for that application. The application will need to request authorization again.')}
            </AlertDescription>
          </Alert>

          <div className='space-y-4'>
            {authorizations.map((auth) => (
              <Card key={auth.client_id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='flex items-center gap-2'>
                        <Shield className='h-5 w-5 text-primary' />
                        {auth.client_name}
                      </CardTitle>
                      <CardDescription className='mt-2'>
                        {t('Authorized on')}{' '}
                        {new Date(auth.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </div>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleRevokeClick(auth)}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      {t('Revoke')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className='mb-2 text-sm font-medium'>{t('Permissions:')}</p>
                    <div className='flex flex-wrap gap-2'>
                      {auth.scopes.split(' ').map((scope) => (
                        <span
                          key={scope}
                          className='inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Revoke Authorization')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Are you sure you want to revoke authorization for')}{' '}
              <span className='font-semibold'>{selectedAuth?.client_name}</span>?
              <br />
              <br />
              {t('This will immediately revoke all access tokens. The application will need to request authorization again to access your account.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
              disabled={revoking}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {revoking && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('Revoke')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
