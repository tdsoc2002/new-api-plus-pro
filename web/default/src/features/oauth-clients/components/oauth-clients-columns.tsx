import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type { OAuthClient } from '../types'
import { DataTableRowActions } from './data-table-row-actions'
import { useTranslation } from 'react-i18next'

export function useOAuthClientsColumns(): ColumnDef<OAuthClient>[] {
  const { t } = useTranslation()

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Application Name')} />
      ),
    },
    {
      accessorKey: 'client_id',
      header: t('Client ID'),
      cell: ({ row }) => (
        <code className='text-xs'>{row.original.client_id.substring(0, 16)}...</code>
      ),
    },
    {
      accessorKey: 'description',
      header: t('Description'),
      cell: ({ row }) => (
        <span className='max-w-[200px] truncate'>{row.original.description || '-'}</span>
      ),
    },
    {
      accessorKey: 'enabled',
      header: t('Status'),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            row.original.enabled
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
          }`}
        >
          {row.original.enabled ? t('Enabled') : t('Disabled')}
        </span>
      ),
    },
    {
      accessorKey: 'require_https',
      header: t('HTTPS'),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            row.original.require_https
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}
        >
          {row.original.require_https ? t('Required') : t('Optional')}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Created At')} />
      ),
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
