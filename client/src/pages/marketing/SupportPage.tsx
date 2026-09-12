import { useState } from 'react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { LifeBuoy, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function SupportPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans antialiased">
      <MarketingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-12">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            <LifeBuoy className="w-4 h-4" /> 24/7 Sales Engineering Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">How Can We Help?</h1>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Get immediate assistance with lead ingestion, Razorpay subscriptions, WhatsApp setups, or custom API configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-3">
            <Mail className="w-6 h-6 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Email Support</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Direct line to our technical operations team. Response under 30 minutes.
            </p>
            <code className="text-[11px] font-mono text-indigo-300 block">support@followupos.com</code>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-3">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">WhatsApp Escalation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Priority WhatsApp channel for Growth & Agency enterprise accounts.
            </p>
            <code className="text-[11px] font-mono text-emerald-400 block">+91 98765 00000</code>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0E1118] space-y-3">
            <LifeBuoy className="w-6 h-6 text-purple-400" />
            <h3 className="text-sm font-bold text-white">In-App Live Chat</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Open a support ticket inside your workspace with real-time status tracking.
            </p>
            <span className="text-[11px] font-mono text-purple-300 font-semibold">Available in Cockpit</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-8 rounded-3xl border border-white/[0.08] bg-[#0E1118] space-y-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white">Send Us a Direct Message</h2>
          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <h3 className="font-bold text-sm">Message Dispatched!</h3>
              <p className="text-xs text-zinc-400">
                A sales engineer has been assigned and will reply to <span className="text-white font-mono">{formData.email}</span> shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Your Name</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Rahul Sharma"
                    className="bg-black/40 border-white/10 text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Work Email</label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@company.com"
                    className="bg-black/40 border-white/10 text-xs h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Subject</label>
                <Input
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Setting up custom lead webhook with Webflow"
                  className="bg-black/40 border-white/10 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Message</label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Explain your question or issue in detail..."
                  className="bg-black/40 border-white/10 text-xs min-h-[120px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-11 rounded-xl gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-3.5 h-3.5" /> Submit Support Request
              </Button>
            </form>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

export default SupportPage
