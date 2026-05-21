import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { createOAuthClient, updateOAuthClient } from '../api'
import { useOAuthClients } from './oauth-clients-provider'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  redirect_uris: z.string().min(1, 'Redirect URIs are required'),
  scopes: z.string().optional(),
  require_https: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function OAuthClientsMutateDrawer() {
  const { t } = useTranslation()
  const {
    mutateDrawerOpen,
    setMutateDrawerOpen,
    currentRow,
    setCurrentRow,
    triggerRefresh,
    setSecretDialogOpen,
    setClientSecret,
  } = useOAuthClients()

  const isUpdate = !!currentRow

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          name: currentRow.name,
          description: currentRow.description || '',
          redirect_uris: currentRow.redirect_uris,
          scopes: currentRow.scopes || 'openid profile email',
          require_https: currentRow.require_https ?? true,
        }
      : {
          name: '',
          description: '',
          redirect_uris: '',
          scopes: 'openid profile email',
          require_https: true,
        },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      if (isUpdate && currentRow) {
        await updateOAuthClient({ ...data, id: currentRow.id })
        toast.success(t('Updated successfully'))
      } else {
        const result = await createOAuthClient(data)
        toast.success(t('Created successfully'))

        // Show client_secret dialog
        if (result.client_secret) {
          setClientSecret(result.client_secret)
          setSecretDialogOpen(true)
        }
      }

      triggerRefresh()
      setMutateDrawerOpen(false)
      setCurrentRow(null)
      form.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Operation failed'))
    }
  }

  const handleOpenChange = (open: boolean) => {
    setMutateDrawerOpen(open)
    if (!open) {
      setCurrentRow(null)
      form.reset()
    }
  }

  return (
    <Sheet open={mutateDrawerOpen} onOpenChange={handleOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-[540px]'>
        <SheetHeader>
          <SheetTitle>
            {isUpdate ? t('Edit OAuth Application') : t('Create OAuth Application')}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='mt-6 space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Application Name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('My Application')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('Application description')}
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='redirect_uris'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Redirect URIs')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='["https://example.com/callback"]'
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('JSON array of allowed redirect URIs')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='scopes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Scopes')}</FormLabel>
                  <FormControl>
                    <Input placeholder='openid profile email' {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('Space-separated list of OAuth scopes')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='require_https'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>{t('Require HTTPS')}</FormLabel>
                    <FormDescription>
                      {t('Enforce HTTPS for all redirect URIs. Recommended for production.')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
              >
                {t('Cancel')}
              </Button>
              <Button type='submit'>{t('Save')}</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
