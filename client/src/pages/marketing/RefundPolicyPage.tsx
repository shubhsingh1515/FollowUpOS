import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { RefreshCw } from 'lucide-react'

export function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-10">
        <div className="space-y-3 border-b border-white/[0.08] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <RefreshCw className="w-4 h-4" /> Billing & Cancellation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Refund & Cancellation Policy</h1>
          <p className="text-xs text-zinc-400 font-mono">Last updated: September 12, 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. 14-Day Free Trial</h2>
            <p>
              We provide a full-featured trial on all tiers so you can test lead ingestion, AI response generation, and follow-up sequences risk-free before any charge is incurred.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Subscription Cancellation</h2>
            <p>
              You can cancel your subscription at any time directly from the customer Billing page. Upon cancellation, your workspace remains fully operational until the end of the current paid billing cycle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Refund Requests</h2>
            <p>
              If you experience technical issues that prevent normal platform usage, please reach out to <code className="text-indigo-300 font-mono">billing@followupos.com</code> within 7 days of the renewal transaction for review.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default RefundPolicyPage
