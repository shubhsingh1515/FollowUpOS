import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Edit3, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/primitives'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || ''
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local[0]}••••@${domain}`
  return `${local[0]}${'•'.repeat(Math.min(local.length - 2, 6))}${local[local.length - 1]}@${domain}`
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email') || ''
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  // State
  const [verifying, setVerifying] = useState(Boolean(token))
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [currentEmail, setCurrentEmail] = useState(emailParam)

  // Resend cooldown & feedback
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')

  // Change email modal state
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [newEmailInput, setNewEmailInput] = useState('')
  const [changingEmailLoading, setChangingEmailLoading] = useState(false)
  const [changeEmailError, setChangeEmailError] = useState('')

  // Token auto-verification effect
  useEffect(() => {
    if (!token) return

    let isMounted = true
    const executeVerify = async () => {
      setVerifying(true)
      setVerificationError('')
      try {
        const { data } = await api.post('/auth/verify-email', {
          token,
          email: emailParam || undefined,
        })

        if (!isMounted) return
        setIsVerified(true)
        if (data.data?.accessToken && data.data?.user && data.data?.organization) {
          setAuth(data.data.user, data.data.organization, data.data.accessToken)
        }
      } catch (err: any) {
        if (!isMounted) return
        setVerificationError(err.response?.data?.message || 'This verification link is no longer valid. It may have expired or already been used.')
      } finally {
        if (isMounted) setVerifying(false)
      }
    }

    executeVerify()
    return () => { isMounted = false }
  }, [token, emailParam, setAuth])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleResend = async () => {
    if (resendCooldown > 0 || !currentEmail) return
    setResending(true)
    setResendMessage('')
    setResendError('')

    try {
      const { data } = await api.post('/auth/resend-verification', { email: currentEmail })
      setResendMessage(data.message || 'Verification email sent. Please check your inbox.')
      setResendCooldown(60)
    } catch (err: any) {
      setResendError(err.response?.data?.message || 'Failed to resend verification email.')
    } finally {
      setResending(false)
    }
  }

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmailInput || !newEmailInput.includes('@')) {
      setChangeEmailError('Please enter a valid work email')
      return
    }

    setChangingEmailLoading(true)
    setChangeEmailError('')

    try {
      const { data } = await api.post('/auth/change-email', {
        currentEmail,
        newEmail: newEmailInput,
      })
      setCurrentEmail(data.email || newEmailInput)
      setIsChangingEmail(false)
      setNewEmailInput('')
      setResendMessage('Email address updated. We have sent a new verification link to your inbox.')
      setResendCooldown(60)
    } catch (err: any) {
      setChangeEmailError(err.response?.data?.message || 'Failed to update email.')
    } finally {
      setChangingEmailLoading(false)
    }
  }

  const handleContinueAfterVerify = () => {
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-foreground tracking-tight">FollowUpOS</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {/* STATE 1: Token Verifying In-Progress */}
          {verifying && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Verifying your email...</h2>
              <p className="text-sm text-muted-foreground">Validating your security token with FollowUpOS.</p>
            </div>
          )}

          {/* STATE 2: Verification Success */}
          {!verifying && isVerified && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Email verified.</h1>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Your FollowUpOS account is ready. Live lead ingestion and AI follow-up automation are now unlocked.
                </p>
              </div>

              <Button
                type="button"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20"
                onClick={handleContinueAfterVerify}
              >
                Continue to FollowUpOS →
              </Button>
            </div>
          )}

          {/* STATE 3: Token Invalid or Expired */}
          {!verifying && token && verificationError && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  This verification link is no longer valid.
                </h1>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  The link may have expired or already been used. Please request a new verification email below.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-border hover:bg-muted text-foreground"
                  onClick={() => navigate('/verify-email' + (currentEmail ? `?email=${encodeURIComponent(currentEmail)}` : ''))}
                >
                  Send me a new verification email
                </Button>
                <Link
                  to="/login"
                  className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STATE 4: Normal "Check Your Inbox" Screen */}
          {!token && !isVerified && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Check your inbox</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent a verification link to:
                </p>
                <div className="inline-block px-3.5 py-1.5 rounded-lg bg-card border border-border font-mono text-sm text-primary">
                  {maskEmail(currentEmail)}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Please verify your email to activate your FollowUpOS workspace and begin capturing leads.
                </p>
              </div>

              {resendMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-xl p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>{resendMessage}</div>
                </div>
              )}

              {resendError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>{resendError}</div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                >
                  {resending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>
                    {resendCooldown > 0
                      ? `Resend available in ${resendCooldown}s`
                      : 'Resend verification email'}
                  </span>
                </Button>

                {!isChangingEmail ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-border hover:bg-muted text-foreground/80 hover:text-foreground text-xs flex items-center justify-center gap-2"
                    onClick={() => setIsChangingEmail(true)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Change email address</span>
                  </Button>
                ) : (
                  <form onSubmit={handleChangeEmailSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <Label htmlFor="newEmail" className="text-xs text-foreground/80">Enter new work email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="new@company.com"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      className="bg-background border-border text-foreground text-sm"
                    />
                    {changeEmailError && <p className="text-xs text-rose-500">{changeEmailError}</p>}
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs flex-1"
                        disabled={changingEmailLoading}
                      >
                        {changingEmailLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Update & Send
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground text-xs"
                        onClick={() => { setIsChangingEmail(false); setChangeEmailError('') }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

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
          )}
        </div>
      </div>
    </div>
  )
}
