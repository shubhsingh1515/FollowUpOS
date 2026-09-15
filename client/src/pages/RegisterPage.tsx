import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/primitives'
import { GoogleIcon } from '@/components/icons/GoogleIcon'
import api from '@/lib/api'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

const INDUSTRIES = [
  { value: 'digital_agency', label: 'Digital Agency' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'marketing_agency', label: 'Marketing Agency' },
  { value: 'immigration_consulting', label: 'Immigration Consulting' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'education_consulting', label: 'Education Consulting' },
  { value: 'solar_energy', label: 'Solar Energy' },
  { value: 'interior_design', label: 'Interior Design' },
  { value: 'other', label: 'Other' },
]

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { industry: 'digital_agency' },
  })

  const passwordValue = watch('password', '')

  const onSubmit = async (values: RegisterForm) => {
    setError('')
    try {
      const { data } = await api.post('/auth/register', values)
      if (data.data?.requiresEmailVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(values.email)}&pending=true`)
      } else {
        navigate('/onboarding')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  const handleGoogleSignup = () => {
    setIsGoogleLoading(true)
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
    window.location.href = `${backendBase}/api/auth/google`
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden border-r border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg tracking-tight">FollowUpOS</div>
              <div className="text-indigo-400 text-xs font-mono">AI Sales Execution Platform</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            14-Day Free Trial · No Credit Card Required
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Turn more conversations into closed revenue.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-6">
            Set up your dedicated sales cockpit in 2 minutes. Connect your lead channels and let AI handle the heavy lifting of continuous follow-ups.
          </p>

          <div className="space-y-3">
            {[
              'Autonomous intent detection on inbound leads',
              'Contextual 1-click AI follow-up replies',
              'Multi-step recovery cadences across Email & WhatsApp',
              'End-to-end multi-tenant isolation with AES-256 encryption'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} FollowUpOS Inc. Enterprise Grade Security.
        </div>
      </div>

      {/* Right panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-6">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">FollowUpOS</div>
              <div className="text-indigo-400 text-xs font-mono">AI Sales Platform</div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
              AI sales execution for teams that don't want valuable leads to slip through.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3.5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Primary: Continue with Google */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 border-white/20 font-medium text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span>Continue with Google</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider font-mono">
              or create account with email
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-300 text-xs font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="Arjun Kapoor"
                {...register('name')}
                className={`bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 ${errors.name ? 'border-red-500/50' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-xs font-medium">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...register('email')}
                className={`bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 ${errors.email ? 'border-red-500/50' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-xs font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  {...register('password')}
                  className={`bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500 pr-10 focus:border-indigo-500 focus:ring-indigo-500/20 ${errors.password ? 'border-red-500/50' : ''}`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordValue && passwordValue.length < 8 && (
                <p className="text-xs text-amber-400 mt-1">Must be at least 8 characters</p>
              )}
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-slate-300 text-xs font-medium">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Agency"
                  {...register('companyName')}
                  className={`bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 ${errors.companyName ? 'border-red-500/50' : ''}`}
                />
                {errors.companyName && <p className="text-xs text-red-400 mt-1">{errors.companyName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="industry" className="text-slate-300 text-xs font-medium">Industry</Label>
                <select
                  id="industry"
                  {...register('industry')}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i.value} value={i.value} className="bg-slate-900 text-white">
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Account
            </Button>

            <p className="text-center text-xs text-slate-500 leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-slate-400 hover:underline">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="text-slate-400 hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <div className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
