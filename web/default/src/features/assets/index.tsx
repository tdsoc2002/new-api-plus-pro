import { useEffect, useMemo, useState } from 'react'
import { Copy, RefreshCw, Trash2, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createAssetGroup,
  deleteAsset,
  getAssetGroups,
  getAssetStorage,
  getAssets,
  syncAsset,
  uploadAssetFile,
  uploadAssetURL,
} from './api'
import type { AssetStorage, SeedanceAsset, SeedanceAssetGroup } from './types'

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let idx = 0
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024
    idx++
  }
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`
}

export function AssetsPage() {
  const { t } = useTranslation()
  const [groups, setGroups] = useState<SeedanceAssetGroup[]>([])
  const [assets, setAssets] = useState<SeedanceAsset[]>([])
  const [storage, setStorage] = useState<AssetStorage | null>(null)
  const [groupId, setGroupId] = useState('')
  const [url, setURL] = useState('')
  const [name, setName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const storagePct = useMemo(() => {
    if (!storage?.limit_bytes) return 0
    return Math.min(100, (storage.used_bytes / storage.limit_bytes) * 100)
  }, [storage])

  const load = async () => {
    setLoading(true)
    try {
      const [groupData, assetData, storageData] = await Promise.all([
        getAssetGroups(),
        getAssets({ group_id: groupId || undefined, page_size: 50 }),
        getAssetStorage(),
      ])
      setGroups(groupData)
      setAssets(assetData.items)
      setStorage(storageData)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Failed to load assets'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [groupId])

  const handleCreateGroup = async () => {
    const trimmed = newGroupName.trim()
    if (!trimmed) return
    try {
      const group = await createAssetGroup({ name: trimmed })
      setGroups((prev) => [group, ...prev])
      setGroupId(group.official_id)
      setNewGroupName('')
      toast.success(t('Asset group created'))
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Failed to create asset group'))
    }
  }

  const handleUploadURL = async () => {
    if (!url.trim()) return
    try {
      await uploadAssetURL({
        group_id: groupId || undefined,
        url: url.trim(),
        name: name.trim() || undefined,
      })
      setURL('')
      setName('')
      toast.success(t('Asset submitted for review'))
      load()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Failed to upload asset'))
    }
  }

  const handleUploadFile = async () => {
    if (!file) return
    try {
      await uploadAssetFile({
        group_id: groupId || undefined,
        file,
        name: name.trim() || file.name,
      })
      setFile(null)
      setName('')
      toast.success(t('Asset uploaded and submitted for review'))
      load()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Failed to upload asset'))
    }
  }

  const copyAssetRef = async (asset: SeedanceAsset) => {
    await navigator.clipboard.writeText(`asset://${asset.official_id}`)
    toast.success(t('Asset reference copied'))
  }

  const handleSync = async (asset: SeedanceAsset) => {
    try {
      await syncAsset(asset.official_id)
      toast.success(t('Asset status refreshed'))
      load()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Failed to refresh asset'))
    }
  }

  const handleDelete = async (asset: SeedanceAsset) => {
    if (!window.confirm(t('Delete this asset?'))) return
    try {
      await deleteAsset(asset.official_id)
      toast.success(t('Asset deleted'))
      load()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Failed to delete asset'))
    }
  }

  return (
    <div className='flex h-full w-full flex-1 flex-col gap-4 p-4'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold'>{t('Asset Library')}</h1>
          <p className='text-muted-foreground text-sm'>
            {t('Manage Seedance reference assets and storage usage')}
          </p>
        </div>
        <Button variant='outline' onClick={load} disabled={loading}>
          <RefreshCw className='size-4' />
          {t('Refresh')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{t('Storage usage')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <Progress value={storagePct} />
          <div className='text-muted-foreground text-sm'>
            {formatBytes(storage?.used_bytes ?? 0)} /{' '}
            {storage?.limit_bytes ? formatBytes(storage.limit_bytes) : t('Unlimited')}
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-[320px_1fr]'>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>{t('Asset groups')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Select value={groupId || 'all'} onValueChange={(v) => setGroupId(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('All groups')}</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.official_id} value={group.official_id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='flex gap-2'>
                <Input
                  value={newGroupName}
                  onChange={(event) => setNewGroupName(event.target.value)}
                  placeholder={t('New group name')}
                />
                <Button type='button' onClick={handleCreateGroup}>
                  {t('Create')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>{t('Upload asset')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('Asset name')}
              />
              <Input
                value={url}
                onChange={(event) => setURL(event.target.value)}
                placeholder='https://cdn.example.com/asset.png'
              />
              <Button className='w-full' type='button' onClick={handleUploadURL}>
                {t('Submit URL')}
              </Button>
              <Input
                type='file'
                accept='image/jpeg,image/png,image/webp,video/mp4,video/quicktime'
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <Button className='w-full' type='button' onClick={handleUploadFile} disabled={!file}>
                <Upload className='size-4' />
                {t('Upload file')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className='grid content-start gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {assets.map((asset) => (
            <Card key={asset.official_id}>
              <CardContent className='space-y-3 p-3'>
                <div className='bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-md'>
                  {asset.preview_url && asset.content_type?.startsWith('video/') ? (
                    <video src={asset.preview_url} className='size-full object-cover' muted />
                  ) : asset.preview_url ? (
                    <img src={asset.preview_url} alt={asset.name} className='size-full object-cover' />
                  ) : (
                    <span className='text-muted-foreground text-sm'>{t('No preview')}</span>
                  )}
                </div>
                <div className='min-w-0'>
                  <div className='truncate text-sm font-medium'>{asset.name || asset.official_id}</div>
                  <div className='text-muted-foreground truncate text-xs'>{asset.official_id}</div>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <Badge variant={asset.status === 'Active' ? 'default' : 'secondary'}>
                    {asset.status}
                  </Badge>
                  <span className='text-muted-foreground text-xs'>{formatBytes(asset.size_bytes)}</span>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='icon' onClick={() => copyAssetRef(asset)}>
                    <Copy className='size-4' />
                  </Button>
                  <Button variant='outline' size='icon' onClick={() => handleSync(asset)}>
                    <RefreshCw className='size-4' />
                  </Button>
                  <Button variant='destructive' size='icon' onClick={() => handleDelete(asset)}>
                    <Trash2 className='size-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {assets.length === 0 && (
            <Card className='md:col-span-2 xl:col-span-3'>
              <CardContent className='text-muted-foreground flex h-40 items-center justify-center'>
                {t('No assets yet')}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
