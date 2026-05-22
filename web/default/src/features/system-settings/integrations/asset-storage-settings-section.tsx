import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from '../components/settings-section'
import { useResetForm } from '../hooks/use-reset-form'
import { useUpdateOption } from '../hooks/use-update-option'
import { removeTrailingSlash } from './utils'

const createSchema = (t: (key: string) => string) =>
  z.object({
    'asset_storage_setting.enabled': z.boolean(),
    'asset_storage_setting.default_limit_bytes': z.coerce.number().min(0),
    'asset_storage_setting.max_file_size_bytes': z.coerce.number().min(0),
    'asset_storage_setting.allowed_mime_types': z.string(),
    'asset_storage_setting.tos_access_key': z.string(),
    'asset_storage_setting.tos_secret_key': z.string(),
    'asset_storage_setting.tos_security_token': z.string(),
    'asset_storage_setting.tos_endpoint': z.string(),
    'asset_storage_setting.tos_region': z.string(),
    'asset_storage_setting.tos_bucket': z.string(),
    'asset_storage_setting.tos_public_base_url': z.string().refine((value) => {
      const trimmed = value.trim()
      if (!trimmed) return true
      return /^https?:\/\//.test(trimmed)
    }, t('Provide a valid URL starting with http:// or https://')),
    'asset_storage_setting.tos_key_prefix': z.string(),
    'asset_storage_setting.seedance_default_model': z.string(),
    'asset_storage_setting.seedance_default_group_name': z.string(),
  })

type AssetStorageFormValues = z.infer<ReturnType<typeof createSchema>>

type Props = {
  defaultValues: AssetStorageFormValues
}

export function AssetStorageSettingsSection({ defaultValues }: Props) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const schema = createSchema(t)
  const form = useForm<AssetStorageFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useResetForm(form, defaultValues)

  const fieldLabels: Record<string, string> = {
    'asset_storage_setting.default_limit_bytes': t(
      'Default user storage limit bytes'
    ),
    'asset_storage_setting.max_file_size_bytes': t(
      'Maximum asset file size bytes'
    ),
    'asset_storage_setting.tos_access_key': t('TOS Access Key'),
    'asset_storage_setting.tos_secret_key': t('TOS Secret Key'),
    'asset_storage_setting.tos_security_token': t('TOS Security Token'),
    'asset_storage_setting.tos_endpoint': t('TOS Endpoint'),
    'asset_storage_setting.tos_region': t('TOS Region'),
    'asset_storage_setting.tos_bucket': t('TOS Bucket'),
    'asset_storage_setting.tos_public_base_url': t('TOS Public Base URL'),
    'asset_storage_setting.tos_key_prefix': t('TOS Key Prefix'),
    'asset_storage_setting.allowed_mime_types': t('Allowed MIME types'),
    'asset_storage_setting.seedance_default_group_name': t(
      'Default asset group name'
    ),
    'asset_storage_setting.seedance_default_model': t(
      'Seedance asset channel model'
    ),
  }

  const onSubmit = async (values: AssetStorageFormValues) => {
    const sanitized = {
      ...values,
      'asset_storage_setting.tos_public_base_url': removeTrailingSlash(
        values['asset_storage_setting.tos_public_base_url']
      ),
      'asset_storage_setting.tos_endpoint': removeTrailingSlash(
        values['asset_storage_setting.tos_endpoint']
      ),
    }
    for (const [key, value] of Object.entries(sanitized)) {
      if (value !== defaultValues[key as keyof AssetStorageFormValues]) {
        await updateOption.mutateAsync({ key, value })
      }
    }
  }

  return (
    <SettingsSection
      title={t('Asset Storage')}
      description={t('Configure TOS storage for user asset libraries')}
    >
      <Form {...form}>
        <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='asset_storage_setting.enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>{t('Enable asset storage')}</FormLabel>
                  <FormDescription>
                    {t('Allow users to upload files to the Seedance asset library.')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className='grid gap-4 md:grid-cols-2'>
            {[
              'asset_storage_setting.default_limit_bytes',
              'asset_storage_setting.max_file_size_bytes',
              'asset_storage_setting.tos_access_key',
              'asset_storage_setting.tos_secret_key',
              'asset_storage_setting.tos_security_token',
              'asset_storage_setting.tos_endpoint',
              'asset_storage_setting.tos_region',
              'asset_storage_setting.tos_bucket',
              'asset_storage_setting.tos_public_base_url',
              'asset_storage_setting.tos_key_prefix',
              'asset_storage_setting.allowed_mime_types',
              'asset_storage_setting.seedance_default_group_name',
              'asset_storage_setting.seedance_default_model',
            ].map((name) => (
              <FormField
                key={name}
                control={form.control}
                name={name as keyof AssetStorageFormValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fieldLabels[name]}</FormLabel>
                    <FormControl>
                      <Input
                        type={name.includes('secret') ? 'password' : 'text'}
                        autoComplete='off'
                        {...field}
                        value={String(field.value ?? '')}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <Button type='submit' disabled={updateOption.isPending}>
            {updateOption.isPending ? t('Saving...') : t('Save asset storage settings')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
