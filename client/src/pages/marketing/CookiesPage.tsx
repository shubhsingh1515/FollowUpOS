import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { Cookie } from 'lucide-react'

export function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-10">
        <div className="space-y-3 border-b border-white/[0.08] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <Cookie className="w-4 h-4" /> Tracking & Cookies
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Cookie Policy</h1>
          <p className="text-xs text-zinc-400 font-mono">Last updated: September 12, 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device that allow FollowUpOS to maintain secure authentication sessions and preserve your dashboard preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Essential Session Cookies</h2>
            <p>
              We use <code className="text-indigo-300 font-mono">httpOnly</code> secure cookies strictly for JWT refresh token rotation. These cookies ensure you remain safely logged in without exposing secrets to browser scripts.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default CookiesPage
