import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plug, CheckCircle2, XCircle, RefreshCw, ExternalLink,
  Copy, Check, AlertCircle, Sparkles, MessageCircle, Mail,
  Calendar, FormInput, Share2, Globe, ShieldCheck, Code2,
  Send, Laptop, CheckSquare, Settings2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

const Label = ({ className, children, ...props }: any) => (
  <label className={cn("text-xs font-medium text-foreground", className)} {...props}>
    {children}
  </label>
)

interface IntegrationItem {
  provider: string
  name: string
  description: string
  category: 'messaging' | 'social' | 'calendar' | 'forms' | 'automation'
  icon: string
  connected: boolean
  lastSync?: string
}

export default function IntegrationsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'catalog' | 'widget' | 'webhook'>('catalog')
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [copiedWidgetCode, setCopiedWidgetCode] = useState(false)

  // Widget customizer state
  const [widgetTitle, setWidgetTitle] = useState('Schedule a Free Consultation')
  const [widgetSubtitle, setWidgetSubtitle] = useState('Our AI will review your requirements and reply in under 5 minutes.')
  const [widgetButtonText, setWidgetButtonText] = useState('Request Discovery Call')
  const [askBudget, setAskBudget] = useState(true)
  const [askTimeline, setAskTimeline] = useState(true)
  const [previewSubmitted, setPreviewSubmitted] = useState(false)

  // Fetch integration statuses from backend
  const { data: serverIntegrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await api.get('/settings/integrations')
      return res.data.data?.integrations || []
    },
  })

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      return api.post(`/settings/integrations/${provider}/connect`, {
        metadata: { connectedAt: new Date().toISOString() },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      return api.delete(`/settings/integrations/${provider}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })

  const isConnected = (provider: string) => {
    const found = serverIntegrations?.find((i: any) => i.provider === provider)
    return found?.status === 'connected'
  }

  const integrationCatalog: IntegrationItem[] = [
    {
      provider: 'whatsapp',
      name: 'WhatsApp Business Cloud API',
      description: 'Send instant AI qualification follow-ups, sync client chats, and receive inbound messages.',
      category: 'messaging',
      icon: '💬',
      connected: isConnected('whatsapp'),
    },
    {
      provider: 'email',
      name: 'Email (SMTP, Gmail & Outlook)',
      description: 'Sync your domain inbox, track opens and click rates, and trigger high-converting cadence drips.',
      category: 'messaging',
      icon: '✉️',
      connected: isConnected('email'),
    },
    {
      provider: 'calendly',
      name: 'Calendly & Cal.com',
      description: 'Auto-detect scheduled discovery calls, auto-pause follow-ups, and trigger pre-call reminders.',
      category: 'calendar',
      icon: '📅',
      connected: isConnected('calendly'),
    },
    {
      provider: 'google_forms',
      name: 'Google Forms & Typeform',
      description: 'Instant lead ingestion the moment a prospect fills your qualification or audit form.',
      category: 'forms',
      icon: '📋',
      connected: isConnected('google_forms'),
    },
    {
      provider: 'facebook',
      name: 'Meta Lead Ads (FB & Insta)',
      description: 'Stream instant lead ads directly into FollowUpOS within 3 seconds of submission.',
      category: 'social',
      icon: '📱',
      connected: isConnected('facebook'),
    },
    {
      provider: 'linkedin',
      name: 'LinkedIn Lead Gen Forms',
      description: 'Ingest B2B enterprise leads directly from LinkedIn Sponsored Content campaigns.',
      category: 'social',
      icon: '💼',
      connected: isConnected('linkedin'),
    },
  ]

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api/public/webhook/lead`
    : 'http://localhost:5000/api/public/webhook/lead'

  const embedScriptCode = `<script async src="${webhookUrl.replace('/api/public/webhook/lead', '/widget.js')}" data-followupos-id="org_live_8849" data-theme="dark"></script>`

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2500)
  }

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(embedScriptCode)
    setCopiedWidgetCode(true)
    setTimeout(() => setCopiedWidgetCode(false), 2500)
  }

  return (
    <div className="p-4 lg:p-6 animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Plug className="w-6 h-6 text-indigo-500" />
            Integrations & Lead Ingestion
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect outreach channels, embed web capture widgets, and configure universal inbound webhooks.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-lg border border-border p-1 bg-muted/30">
          <button
            onClick={() => setActiveTab('catalog')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
              activeTab === 'catalog' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Channels ({integrationCatalog.length})
          </button>
          <button
            onClick={() => setActiveTab('widget')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
              activeTab === 'widget' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Website Widget Builder
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
              activeTab === 'webhook' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Universal Webhook
          </button>
        </div>
      </div>

      {/* TAB 1: Channels Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrationCatalog.map((item) => {
              const connected = item.connected
              return (
                <Card key={item.provider} className="flex flex-col justify-between hover:shadow-md transition-all duration-200 border-border/70">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-3xl p-2 rounded-xl bg-muted/40 border border-border/40">{item.icon}</div>
                      <Badge variant={connected ? 'outline' : 'secondary'} className={connected ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px]' : 'text-[10px]'}>
                        {connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold mt-3">{item.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground capitalize font-medium">
                      {item.category}
                    </span>

                    {connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-destructive hover:bg-destructive/10 h-8 border-destructive/30"
                        disabled={disconnectMutation.isPending}
                        onClick={() => disconnectMutation.mutate(item.provider)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white h-8"
                        disabled={connectMutation.isPending}
                        onClick={() => connectMutation.mutate(item.provider)}
                      >
                        Connect Channel
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Embeddable Widget Generator */}
      {activeTab === 'widget' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Left: Customizer */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-600" />
                  Lead Capture Form Customizer
                </CardTitle>
                <CardDescription className="text-xs">
                  Generate an embeddable lead capture card or slide-out modal for your service website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Headline Title</Label>
                  <Input
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Subtitle / Promise</Label>
                  <Input
                    value={widgetSubtitle}
                    onChange={(e) => setWidgetSubtitle(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">CTA Button Text</Label>
                  <Input
                    value={widgetButtonText}
                    onChange={(e) => setWidgetButtonText(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qualification Fields</Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={askBudget}
                        onChange={(e) => setAskBudget(e.target.checked)}
                        className="rounded border-border"
                      />
                      Include Expected Budget Tier (₹50k - ₹10L+)
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={askTimeline}
                        onChange={(e) => setAskTimeline(e.target.checked)}
                        className="rounded border-border"
                      />
                      Include Target Project Timeline (Immediate / 30 Days)
                    </label>
                  </div>
                </div>

                {/* Embed Script Box */}
                <div className="pt-3 border-t border-border/50 space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                    <span>Embed Code (HTML / React / Webflow)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyWidget}
                      className="h-6 text-[11px] gap-1"
                    >
                      {copiedWidgetCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedWidgetCode ? 'Copied' : 'Copy'}
                    </Button>
                  </Label>
                  <div className="p-3 bg-muted font-mono text-[11px] rounded-lg border border-border/60 overflow-x-auto select-all text-muted-foreground">
                    {embedScriptCode}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Live Interactive Widget Preview */}
          <div className="lg:col-span-6 space-y-2">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5" /> Live Visitor Preview
            </div>

            <Card className="border-border/80 shadow-xl overflow-hidden bg-card">
              <div className="h-9 bg-muted/60 border-b border-border/60 px-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-muted-foreground font-mono ml-2">https://yourserviceagency.com/contact</span>
              </div>

              <div className="p-6 max-w-md mx-auto space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{widgetTitle}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{widgetSubtitle}</p>
                </div>

                {previewSubmitted ? (
                  <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-fade-in">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Inquiry Received!</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Our sales copilot has received your details and queued an instant reply.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setPreviewSubmitted(false)} className="text-xs h-7 mt-2">
                      Reset Demo Form
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setPreviewSubmitted(true); }} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Full Name</Label>
                      <Input placeholder="e.g. Rahul Sharma" required className="text-xs h-8 bg-background" defaultValue="Arjun Kapoor" />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Work Email / WhatsApp</Label>
                      <Input placeholder="arjun@growthscale.in" required className="text-xs h-8 bg-background" defaultValue="+91 98765 43210" />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Service Required</Label>
                      <Input placeholder="e.g. Performance Marketing, SEO, Web App" required className="text-xs h-8 bg-background" defaultValue="SaaS Lead Gen & CRM Setup" />
                    </div>

                    {askBudget && (
                      <div className="space-y-1">
                        <Label className="text-[11px]">Budget Range</Label>
                        <select className="w-full text-xs h-8 rounded-md border border-input bg-background px-2 text-foreground">
                          <option>₹1,00,000 - ₹2,50,000 / month</option>
                          <option>₹2,50,000 - ₹5,00,000 / month</option>
                          <option>₹5,00,000+ Enterprise Tier</option>
                        </select>
                      </div>
                    )}

                    {askTimeline && (
                      <div className="space-y-1">
                        <Label className="text-[11px]">Target Timeline</Label>
                        <select className="w-full text-xs h-8 rounded-md border border-input bg-background px-2 text-foreground">
                          <option>Immediately (Within 7 days)</option>
                          <option>Next 30 days</option>
                          <option>Exploratory / Next Quarter</option>
                        </select>
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-semibold mt-2">
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {widgetButtonText}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: Universal Webhook Docs */}
      {activeTab === 'webhook' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-600" />
                    Universal Inbound Lead Webhook API
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Send a POST request from any frontend form, Zapier, Make, n8n, or custom backend.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs py-1 px-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active & Tested
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Endpoint URL (POST)</Label>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-muted px-3 py-2 rounded-lg border border-border/80 flex-1 select-all text-foreground">
                    {webhookUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs"
                    onClick={handleCopyWebhook}
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedWebhook ? 'Copied' : 'Copy URL'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold">JSON Request Payload Schema</Label>
                <pre className="p-4 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed">
{`{
  "name": "Vikram Sethi",
  "email": "vikram@techcorp.in",
  "phone": "+91 98200 12345",
  "company": "TechCorp Logistics",
  "serviceRequired": "Sales Automation & CRM AI",
  "budget": 250000,
  "timeline": "immediate",
  "source": "website_contact_form"
}`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200">
                <strong>Automatic Pipeline Behavior:</strong> When received, FollowUpOS will deduplicate by phone/email, trigger AI intent analysis, calculate the lead score (0-100), and auto-enroll the prospect in your high-priority follow-up sequence.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
