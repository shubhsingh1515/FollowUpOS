import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { ShieldCheck } from 'lucide-react'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-10">
        <div className="space-y-3 border-b border-white/[0.08] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <ShieldCheck className="w-4 h-4" /> Legal & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-zinc-400 font-mono">Last updated: September 12, 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              FollowUpOS collects information to provide intelligent sales execution services to businesses. This includes account credentials, workspace profile data, lead contact information submitted through connected lead forms, APIs, WhatsApp Business, and webhook integrations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Multi-Tenant Data Isolation & Security</h2>
            <p>
              Every organization’s data is strictly isolated using tenant-level identifiers. Your lead records, contact histories, and custom AI prompt instructions are never shared with other tenants or used to train public language models without explicit enterprise consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Third-Party Integration Access</h2>
            <p>
              When you connect third-party services (such as Razorpay, WhatsApp Business, Meta Lead Ads, or Google Workspace), OAuth credentials and access tokens are encrypted at rest using AES-256-GCM. We only process data necessary to fulfill automated sales follow-up cadences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Data Deletion & Export</h2>
            <p>
              You maintain complete ownership of your data. Organization administrators can export all contacts, leads, conversations, and analytics via CSV at any time, or request complete cryptographic workspace deletion via the customer settings portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Contact Information</h2>
            <p>
              For any questions regarding this Privacy Policy or your data protection rights, please contact our Data Protection Officer at <code className="text-indigo-300 font-mono">privacy@followupos.com</code>.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default PrivacyPage
