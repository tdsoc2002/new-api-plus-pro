export type SeedanceAssetGroup = {
  id: number
  user_id: number
  channel_id: number
  official_id: string
  name: string
  description?: string
  created_at: number
  updated_at: number
}

export type SeedanceAsset = {
  id: number
  user_id: number
  group_id: number
  channel_id: number
  official_id: string
  name: string
  status: string
  fail_reason?: string
  source_url: string
  preview_url: string
  storage_provider: string
  content_type: string
  size_bytes: number
  created_at: number
  updated_at: number
  last_synced_at: number
}

export type AssetStorage = {
  user_id: number
  used_bytes: number
  limit_bytes: number
  updated_at: number
}

export type AssetListResponse = {
  items: SeedanceAsset[]
  total: number
}
