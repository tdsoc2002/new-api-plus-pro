import { useQuery } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { DataTablePage } from '@/components/data-table'
import { getOAuthClients } from '../api'
import { useOAuthClientsColumns } from './oauth-clients-columns'
import { useOAuthClients } from './oauth-clients-provider'
import { useTranslation } from 'react-i18next'

export function OAuthClientsTable() {
  const { t } = useTranslation()
  const columns = useOAuthClientsColumns()
  const { refreshTrigger } = useOAuthClients()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['oauth-clients', refreshTrigger],
    queryFn: () => getOAuthClients(),
  })

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  return (
    <DataTablePage
      table={table}
      columns={columns}
      isLoading={isLoading}
      emptyTitle={t('No OAuth Applications')}
      emptyDescription={t('Create your first OAuth application to get started')}
      toolbarProps={{
        searchPlaceholder: t('Search applications...'),
        searchColumn: 'name',
      }}
    />
  )
}
