import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, CheckCircle2, AlertCircle } from 'lucide-react'
import { getOAuthAuthorizeData, submitOAuthAuthorize } from './api'
import type { OAuthAuthorizeData } from './types'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const SCOPE_DESCRIPTIONS: Record<string, { icon: string; description: string }> = {
  openid: {
    icon: '🔑',
    description: 'Basic identity information',
  },
  profile: {
    icon: '👤',
    description: 'Your username and display name',
  },
  email: {
    icon: '📧',
    description: 'Your email address',
  },
}

export function OAuthAuthorizePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authorizeData, setAuthorizeData] = useState<OAuthAuthorizeData | null>(null)

  useEffect(() => {
    const fetchAuthorizeData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query params from URL search
        const params = new URLSearchParams(search as Record<string, string>)

        const data = await getOAuthAuthorizeData(params)
        setAuthorizeData(data)
      } catch (err: any) {
        const errorMsg = err.response?.data?.error_description || err.response?.data?.message || t('Failed to load authorization request')
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchAuthorizeData()
  }, [search, t])

  const handleApprove = async () => {
    if (!authorizeData) return

    try {
      setSubmitting(true)
      const response = await submitOAuthAuthorize({
        client_id: authorizeData.client_id,
        redirect_uri: authorizeData.redirect_uri,
        scope: authorizeData.scope,
        state: authorizeData.state,
        code_challenge: authorizeData.code_challenge,
        code_challenge_method: authorizeData.code_challenge_method,
        approved: true,
      })

      if (response.success && response.redirect_url) {
        // Redirect to the third-party application
        window.location.href = response.redirect_url
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Authorization failed'))
      setSubmitting(false)
    }
  }

  const handleDeny = async () => {
    if (!authorizeData) return

    try {
      setSubmitting(true)
      const response = await submitOAuthAuthorize({
        client_id: authorizeData.client_id,
        redirect_uri: authorizeData.redirect_uri,
        scope: authorizeData.scope,
        state: authorizeData.state,
        code_challenge: authorizeData.code_challenge,
        code_challenge_method: authorizeData.code_challenge_method,
        approved: false,
      })

      if (response.success && response.redirect_url) {
        // Redirect back with error
        window.location.href = response.redirect_url
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Operation failed'))
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='mx-auto h-8 w-8 animate-spin text-primary' />
          <p className='mt-4 text-sm text-muted-foreground'>{t('Loading...')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-destructive' />
              <CardTitle>{t('Authorization Error')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              className='mt-4 w-full'
              variant='outline'
              onClick={() => navigate({ to: '/' })}
            >
              {t('Back to Home')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!authorizeData) {
    return null
  }

  const scopes = authorizeData.scope.split(' ').filter(Boolean)

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
            <Shield className='h-6 w-6 text-primary' />
          </div>
          <CardTitle className='text-2xl'>{t('Authorize Application')}</CardTitle>
          <CardDescription>
            <span className='font-semibold text-foreground'>{authorizeData.client_name}</span>
            {' ' + t('wants to access your account')}
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {authorizeData.client_description && (
            <div className='rounded-lg bg-muted p-3'>
              <p className='text-sm text-muted-foreground'>
                {authorizeData.client_description}
              </p>
            </div>
          )}

          <div>
            <h3 className='mb-3 flex items-center gap-2 text-sm font-medium'>
              <CheckCircle2 className='h-4 w-4 text-primary' />
              {t('This application will be able to:')}
            </h3>
            <ul className='space-y-2'>
              {scopes.map((scope) => {
                const scopeInfo = SCOPE_DESCRIPTIONS[scope]
                return (
                  <li
                    key={scope}
                    className='flex items-start gap-3 rounded-lg border bg-card p-3'
                  >
                    <span className='text-xl'>{scopeInfo?.icon || '🔒'}</span>
                    <div className='flex-1'>
                      <p className='font-medium capitalize'>{scope}</p>
                      <p className='text-sm text-muted-foreground'>
                        {scopeInfo?.description || t('Access your') + ' ' + scope}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <Alert>
            <AlertDescription className='text-xs'>
              {t('By authorizing, you allow this application to access the information listed above. You can revoke access at any time from your account settings.')}
            </AlertDescription>
          </Alert>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              className='flex-1'
              onClick={handleDeny}
              disabled={submitting}
            >
              {t('Deny')}
            </Button>
            <Button
              className='flex-1'
              onClick={handleApprove}
              disabled={submitting}
            >
              {submitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('Authorize')}
            </Button>
          </div>

          <p className='text-center text-xs text-muted-foreground'>
            {t('Redirecting to:')} <span className='font-mono'>{authorizeData.redirect_uri}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
