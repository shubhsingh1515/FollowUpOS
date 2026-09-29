import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Sparkles, Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/primitives'
import api from '@/lib/api'

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetForm = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email') || ''
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (values: ResetForm) => {
    if (!token) {
      setError('Missing password reset token. Please request a new link.')
      return
    }

    setError('')
    try {
      await api.post('/auth/reset-password', {
        token,
        email: email || undefined,
        newPassword: values.password,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-foreground tracking-tight">FollowUpOS</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create new password</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Choose a strong password with at least 8 characters.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Password reset successfully!</h2>
                <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                  Your password has been updated and previous sessions have been invalidated. Please sign in with your new credentials.
                </p>
              </div>

              <Button
                type="button"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-md shadow-primary/20 mt-4"
                onClick={() => navigate('/login')}
              >
                Sign In to FollowUpOS →
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-foreground/80 text-xs font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    {...register('password')}
                    className={`bg-background border-border text-foreground placeholder:text-muted-foreground pr-10 focus:border-primary focus:ring-primary/20 ${errors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-foreground/80 text-xs font-medium">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  {...register('confirmPassword')}
                  className={`bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 ${errors.confirmPassword ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                />
                {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-md shadow-primary/20 transition-all mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Reset Password
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
