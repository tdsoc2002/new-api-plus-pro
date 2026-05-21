import { createContext, useContext, useState, type ReactNode } from 'react'
import type { OAuthClient } from '../types'

interface OAuthClientsContextType {
  refreshTrigger: number
  triggerRefresh: () => void
  currentRow: OAuthClient | null
  setCurrentRow: (row: OAuthClient | null) => void
  mutateDrawerOpen: boolean
  setMutateDrawerOpen: (open: boolean) => void
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  secretDialogOpen: boolean
  setSecretDialogOpen: (open: boolean) => void
  clientSecret: string | null
  setClientSecret: (secret: string | null) => void
}

const OAuthClientsContext = createContext<OAuthClientsContextType | undefined>(undefined)

export function OAuthClientsProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [currentRow, setCurrentRow] = useState<OAuthClient | null>(null)
  const [mutateDrawerOpen, setMutateDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [secretDialogOpen, setSecretDialogOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1)

  return (
    <OAuthClientsContext.Provider
      value={{
        refreshTrigger,
        triggerRefresh,
        currentRow,
        setCurrentRow,
        mutateDrawerOpen,
        setMutateDrawerOpen,
        deleteDialogOpen,
        setDeleteDialogOpen,
        secretDialogOpen,
        setSecretDialogOpen,
        clientSecret,
        setClientSecret,
      }}
    >
      {children}
    </OAuthClientsContext.Provider>
  )
}

export function useOAuthClients() {
  const context = useContext(OAuthClientsContext)
  if (!context) {
    throw new Error('useOAuthClients must be used within OAuthClientsProvider')
  }
  return context
}
