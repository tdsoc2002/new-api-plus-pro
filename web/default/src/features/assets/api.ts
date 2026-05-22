import { api } from '@/lib/api'
import type {
  AssetListResponse,
  AssetStorage,
  SeedanceAsset,
  SeedanceAssetGroup,
} from './types'

export async function getAssetGroups(): Promise<SeedanceAssetGroup[]> {
  const res = await api.get('/api/seedance/asset-groups')
  return res.data.data
}

export async function createAssetGroup(input: {
  name: string
  description?: string
}): Promise<SeedanceAssetGroup> {
  const res = await api.post('/api/seedance/asset-groups', input)
  return res.data.data
}

export async function getAssetStorage(): Promise<AssetStorage> {
  const res = await api.get('/api/seedance/asset-storage')
  return res.data.data
}

export async function getAssets(params: {
  group_id?: string
  status?: string
  page_num?: number
  page_size?: number
}): Promise<AssetListResponse> {
  const res = await api.get('/api/seedance/assets', { params })
  return res.data.data
}

export async function uploadAssetURL(input: {
  group_id?: string
  url: string
  name?: string
}): Promise<SeedanceAsset> {
  const res = await api.post('/api/seedance/assets/url', input)
  return res.data.data
}

export async function uploadAssetFile(input: {
  group_id?: string
  file: File
  name?: string
}): Promise<SeedanceAsset> {
  const formData = new FormData()
  formData.append('file', input.file)
  if (input.group_id) formData.append('group_id', input.group_id)
  if (input.name) formData.append('name', input.name)
  const res = await api.post('/api/seedance/assets/upload', formData)
  return res.data.data
}

export async function syncAsset(officialId: string): Promise<SeedanceAsset> {
  const res = await api.post(`/api/seedance/assets/${officialId}/sync`)
  return res.data.data
}

export async function deleteAsset(officialId: string): Promise<void> {
  await api.delete(`/api/seedance/assets/${officialId}`)
}
