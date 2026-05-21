import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useOAuthClients } from './oauth-clients-provider'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function OAuthClientsSecretDialog() {
  const { t } = useTranslation()
  const { secretDialogOpen, setSecretDialogOpen, clientSecret, setClientSecret } =
    useOAuthClients()

  const handleCopy = () => {
    if (clientSecret) {
      navigator.clipboard.writeText(clientSecret)
      toast.success(t('Copied to clipboard'))
    }
  }

  const handleClose = () => {
    setSecretDialogOpen(false)
    setClientSecret(null)
  }

  return (
    <AlertDialog open={secretDialogOpen} onOpenChange={setSecretDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Client Secret')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              'Please save this client secret. You will not be able to see it again after closing this dialog.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='my-4'>
          <div className='flex items-center gap-2 rounded-md border bg-muted p-3'>
            <code className='flex-1 break-all text-sm'>{clientSecret}</code>
            <Button size='sm' variant='ghost' onClick={handleCopy}>
              <Copy className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>{t('I have saved it')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
