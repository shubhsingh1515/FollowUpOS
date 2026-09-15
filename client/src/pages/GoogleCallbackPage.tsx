import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const isNew = searchParams.get('isNew') === 'true'
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      setTimeout(() => navigate(`/login?error=${encodeURIComponent(errorParam)}`), 2500)
      return
    }

    if (!token) {
      setError('Authentication token was not received from Google.')
      setTimeout(() => navigate('/login?error=Missing+authentication+token'), 2500)
      return
    }

    const resolveSession = async () => {
      try {
        localStorage.setItem('accessToken', token)
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (data.data?.user && data.data?.organization) {
          setAuth(data.data.user, data.data.organization, token)

          const needsOnboarding = isNew || (
            !data.data.user.onboardingCompleted && !data.data.organization.onboardingCompleted
          )

          if (needsOnboarding) {
            navigate('/onboarding', { replace: true })
          } else {
            navigate('/today', { replace: true })
          }
        } else {
          throw new Error('Incomplete profile data')
        }
      } catch (err: any) {
        setError('Failed to establish session. Redirecting to sign in...')
        setTimeout(() => navigate('/login?error=Session+initialization+failed'), 2500)
      }
    }

    resolveSession()
  }, [searchParams, navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-slate-100">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 mx-auto animate-bounce">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-4 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white tracking-tight">Authenticating with Google...</h2>
            <p className="text-xs text-slate-400">Verifying identity and preparing your sales workspace.</p>
          </div>
        )}
      </div>
    </div>
  )
}
