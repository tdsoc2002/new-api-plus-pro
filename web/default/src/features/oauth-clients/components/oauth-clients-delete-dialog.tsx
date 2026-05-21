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
import { deleteOAuthClient } from '../api'
import { useOAuthClients } from './oauth-clients-provider'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function OAuthClientsDeleteDialog() {
  const { t } = useTranslation()
  const { deleteDialogOpen, setDeleteDialogOpen, currentRow, setCurrentRow, triggerRefresh } =
    useOAuthClients()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await deleteOAuthClient(currentRow.id)
      toast.success(t('Deleted successfully'))
      triggerRefresh()
      setDeleteDialogOpen(false)
      setCurrentRow(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Delete failed'))
    }
  }

  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Delete OAuth Application')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Are you sure you want to delete')} <strong>{currentRow?.name}</strong>?{' '}
            {t('This action cannot be undone.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className='bg-red-600 hover:bg-red-700'>
            {t('Delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
