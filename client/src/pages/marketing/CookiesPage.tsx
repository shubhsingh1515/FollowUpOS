import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { Cookie } from 'lucide-react'

export function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-10">
        <div className="space-y-3 border-b border-border pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-primary">
            <Cookie className="w-4 h-4" /> Tracking & Cookies
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Cookie Policy</h1>
          <p className="text-xs text-muted-foreground font-mono">Last updated: September 12, 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-foreground/80 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device that allow FollowUpOS to maintain secure authentication sessions and preserve your dashboard preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Essential Session Cookies</h2>
            <p>
              We use <code className="text-primary font-mono">httpOnly</code> secure cookies strictly for JWT refresh token rotation. These cookies ensure you remain safely logged in without exposing secrets to browser scripts.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default CookiesPage
