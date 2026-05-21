import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOAuthClients } from './oauth-clients-provider'
import type { OAuthClient } from '../types'
import { useTranslation } from 'react-i18next'

interface DataTableRowActionsProps {
  row: Row<OAuthClient>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation()
  const { setCurrentRow, setMutateDrawerOpen, setDeleteDialogOpen } = useOAuthClients()

  const handleEdit = () => {
    setCurrentRow(row.original)
    setMutateDrawerOpen(true)
  }

  const handleDelete = () => {
    setCurrentRow(row.original)
    setDeleteDialogOpen(true)
  }

  const handleRegenerateSecret = () => {
    setCurrentRow(row.original)
    // This will be handled in a separate dialog
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className='mr-2 h-4 w-4' />
          {t('Edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRegenerateSecret}>
          <Key className='mr-2 h-4 w-4' />
          {t('Regenerate Secret')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-red-600'>
          <Trash2 className='mr-2 h-4 w-4' />
          {t('Delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
