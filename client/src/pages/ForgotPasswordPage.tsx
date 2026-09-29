import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Sparkles, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/primitives'
import api from '@/lib/api'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid work email'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (values: ForgotForm) => {
    setError('')
    try {
      await api.post('/auth/forgot-password', { email: values.email })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit reset request. Please try again.')
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
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset your password</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enter your work email and we'll send you a single-use link to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {submitted ? (
            <div className="space-y-5 text-center py-2">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4 flex items-start gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                <div className="leading-relaxed">
                  If an account exists with this email, a password reset link has been dispatched to your inbox.
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Please check your inbox and click the reset button within 1 hour.
              </p>
              <Link to="/login">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm mt-4">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground/80 text-xs font-medium">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register('email')}
                  className={`bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 ${errors.email ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-md shadow-primary/20 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
