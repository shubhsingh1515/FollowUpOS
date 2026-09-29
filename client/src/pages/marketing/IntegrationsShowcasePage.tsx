import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plug, Sparkles, ArrowRight, ShieldCheck, Copy, Check,
  Code2, Send, CheckCircle2, MessageSquare, Mail, Calendar,
  Share2, Globe, Database,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const CHANNELS_CATALOG = [
  {
    name: 'WhatsApp Business Cloud API',
    icon: '💬',
    category: 'Messaging',
    desc: 'Instant 2-way AI conversational outreach, discovery meeting booking, and automated cadence drips directly on WhatsApp.',
    latency: '< 2.4s Delivery',
    status: 'Official Meta BSP Sync',
  },
  {
    name: 'Gmail & Google Workspace',
    icon: '✉️',
    category: 'Email',
    desc: 'Send personalized follow-ups from your own domain inbox with full email open, click, and reply tracking.',
    latency: 'Real-time IMAP / SMTP',
    status: 'Direct OAuth2 Sync',
  },
  {
    name: 'Meta Lead Ads (Facebook & Instagram)',
    icon: '📱',
    category: 'Lead Gen Ads',
    desc: 'Stream instant lead ads directly into FollowUpOS within 3 seconds of prospect submission.',
    latency: '< 3s Ingestion',
    status: 'Instant Webhook',
  },
  {
    name: 'Calendly & Cal.com',
    icon: '📅',
    category: 'Calendar',
    desc: 'Automatically halts outreach sequences when appointments are scheduled on your calendar and sends pre-call reminders.',
    latency: 'Instant Sync',
    status: 'Auto-Pause Trigger',
  },
  {
    name: 'Google Forms & Typeform',
    icon: '📋',
    category: 'Forms',
    desc: 'Qualifies website and consultation audit submissions with deterministic 0-100 scoring.',
    latency: '< 1s Webhook',
    status: 'JSON Payload Parsing',
  },
  {
    name: 'Zapier, Make & n8n',
    icon: '⚡',
    category: 'Automation',
    desc: 'Connect your existing CRM, Airtable, HubSpot, or custom databases with bi-directional sync.',
    latency: 'API / Webhook',
    status: 'Full REST API',
  },
]

export default function IntegrationsShowcasePage() {
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
  const webhookEndpoint = `${backendBase}/api/public/webhook/lead`

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookEndpoint)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2500)
  }

  const simulateTest = () => {
    setTestSuccess(true)
    setTimeout(() => setTestSuccess(false), 4000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans antialiased">
      <MarketingNavbar />

      {/* Hero Header */}
      <section className="pt-36 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center max-w-3xl">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-semibold uppercase tracking-wider py-1 px-3">
            Ecosystem Directory
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Connect Every Lead Source <span className="text-primary italic">In 2 Clicks.</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Ingest leads from WhatsApp, Meta Ads, Typeform, Webflow, and Gmail. FollowUpOS unifies every inbound signal into one high-velocity sales cockpit.
          </p>
        </div>
      </section>

      {/* Channels Grid */}
      <section className="py-12 relative bg-muted/30 border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHANNELS_CATALOG.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl p-2.5 rounded-2xl bg-muted/50 border border-border">{item.icon}</span>
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 border-emerald-200 bg-emerald-50">
                      {item.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{item.category}</span>
                  <span className="text-primary font-semibold">{item.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universal Webhook Interactive Sandbox */}
      <section className="py-24 relative bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-xl space-y-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-semibold uppercase tracking-wider">
              Developer Sandbox
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Universal Inbound Webhook API
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Send a simple HTTP POST request from Webflow, custom forms, or Zapier to ingest, qualify, and score any lead instantly.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground font-mono">POST Endpoint URL</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-muted border border-border px-4 py-2.5 rounded-xl text-primary flex-1 select-all overflow-x-auto">
                  {webhookEndpoint}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border border-border bg-card text-foreground hover:bg-muted text-xs h-10 px-4 rounded-xl gap-1.5 transition-all"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedWebhook ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground font-mono">Sample JSON Request Payload</span>
              <pre className="p-4 rounded-2xl bg-muted border border-border text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed">
{`{
  "name": "Sarah Mitchell",
  "email": "sarah@acmedigital.com",
  "phone": "+91 98201 11223",
  "company": "Acme Digital Labs",
  "serviceRequired": "Sales Automation & CRM Setup",
  "budget": 240000,
  "timeline": "immediate",
  "source": "website_contact_form"
}`}
              </pre>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SSL Encrypted · Multi-Tenant Isolated</span>
              </div>
              <Button
                onClick={simulateTest}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-4 rounded-xl gap-1.5 shadow-sm"
              >
                {testSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Send className="w-3.5 h-3.5" />}
                {testSuccess ? 'Simulation Ingested (Score: 92)' : 'Test Payload Ingestion'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
