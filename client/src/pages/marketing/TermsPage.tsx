import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { FileText } from 'lucide-react'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-10">
        <div className="space-y-3 border-b border-white/[0.08] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <FileText className="w-4 h-4" /> Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-zinc-400 font-mono">Last updated: September 12, 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using FollowUpOS, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. SaaS Subscriptions & Commercial Plans</h2>
            <p>
              FollowUpOS is provided on a recurring subscription basis (Starter at ₹999/mo, Growth at ₹2,999/mo, and Agency at ₹7,999/mo). Subscriptions automatically renew at the end of each billing cycle unless cancelled prior to renewal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Acceptable Use & Anti-Spam Policy</h2>
            <p>
              You agree not to use FollowUpOS for transmitting unsolicited marketing messages, bulk spam, or deceptive content. All outbound messages and WhatsApp templates must adhere to Meta’s Business Messaging policies and local anti-spam regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Service Level & Availability</h2>
            <p>
              We strive to maintain a 99.9% uptime for core API ingestion and automated cadence execution. Maintenance windows are scheduled outside peak sales hours with advance notice.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default TermsPage
