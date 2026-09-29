import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/primitives'
import { useAuthStore } from '@/store/authStore'
import { GoogleIcon } from '@/components/icons/GoogleIcon'
import api from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginForm) => {
    setError('')
    try {
      const { data } = await api.post('/auth/login', values)
      setAuth(data.data.user, data.data.organization, data.data.accessToken)
      if (data.data.user.onboardingCompleted || data.data.organization.onboardingCompleted) {
        navigate('/today')
      } else {
        navigate('/onboarding')
      }
    } catch (err: any) {
      const respData = err.response?.data
      if (respData?.code === 'EMAIL_NOT_VERIFIED') {
        const userEmail = respData?.email || values.email
        navigate(`/verify-email?email=${encodeURIComponent(userEmail)}&pending=true`)
        return
      }
      setError(respData?.message || 'Invalid email or password. Please try again.')
    }
  }

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true)
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
    const clientOrigin = window.location.origin
    window.location.href = `${backendBase}/api/auth/google?clientUrl=${encodeURIComponent(clientOrigin)}`
  }



  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left panel - branding & value statement */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden border-r border-border bg-muted/30 backdrop-blur-xl">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-foreground text-lg tracking-tight">FollowUpOS</div>
              <div className="text-primary text-xs font-mono">AI Sales Execution Platform</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Autonomous Multi-Channel Follow-up
          </div>
          <h1 className="text-4xl font-extrabold text-foreground leading-tight tracking-tight mb-4">
            Never let a high-value lead slip through the cracks.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            FollowUpOS captures inbound leads across WhatsApp, Email, Meta Ads, and Web Forms — instantly scoring intent, drafting contextual replies, and executing timed follow-up cadences.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Avg. Response Time', value: '< 60s' },
              { label: 'Follow-up Cadence', value: '4 Steps AI' },
              { label: 'Lead Recovery Rate', value: '+42%' },
              { label: 'Multi-Tenant Security', value: 'AES-256' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-3.5 shadow-sm">
                <div className="text-xl font-bold text-foreground font-mono">{stat.value}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground font-mono">
          © {new Date().getFullYear()} FollowUpOS Inc. Production Grade & Tenant Isolated.
        </div>
      </div>

      {/* Right panel - Auth card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-foreground text-lg">FollowUpOS</div>
              <div className="text-primary text-xs font-mono">AI Sales Platform</div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome to FollowUpOS</h2>
            <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
              AI sales execution for teams that don't want valuable leads to slip through.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl p-3.5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Primary: Continue with Google */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-card hover:bg-muted text-foreground border-border font-medium text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span>Continue with Google</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <div className="bg-background px-3 text-xs text-muted-foreground uppercase font-mono absolute">
              or sign in with email
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground/80 text-xs font-medium">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...register('email')}
                className={`bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 ${errors.email ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/80 text-xs font-medium">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`bg-background border-border text-foreground placeholder:text-muted-foreground pr-10 focus:border-primary focus:ring-primary/20 ${errors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-md shadow-primary/20 transition-all mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sign In
            </Button>
          </form>



          <div className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
