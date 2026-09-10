import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plug, CheckCircle2, XCircle, RefreshCw, ExternalLink,
  Copy, Check, AlertCircle, Sparkles, MessageCircle, Mail,
  Calendar, FormInput, Share2, Globe, ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

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
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)

  // Fetch integration statuses from backend
  const { data: serverIntegrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await api.get('/settings/integrations')
      return res.data.data.integrations || []
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
      setConnectingProvider(null)
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
      name: 'WhatsApp Business API',
      description: 'Send automated WhatsApp follow-ups, receive instant inquiries, and converse via AI.',
      category: 'messaging',
      icon: '💬',
      connected: isConnected('whatsapp'),
    },
    {
      provider: 'email',
      name: 'Email (SMTP & Gmail)',
      description: 'Sync your business inbox, track opens and clicks, and trigger personalized drip campaigns.',
      category: 'messaging',
      icon: '✉️',
      connected: isConnected('email'),
    },
    {
      provider: 'calendly',
      name: 'Calendly & Cal.com',
      description: 'Auto-sync scheduled discovery meetings and trigger pre-call confirmation follow-ups.',
      category: 'calendar',
      icon: '📅',
      connected: isConnected('calendly'),
    },
    {
      provider: 'google_forms',
      name: 'Google Forms & Typeform',
      description: 'Instant lead ingestion the moment a prospective client submits a consultation request.',
      category: 'forms',
      icon: '📋',
      connected: isConnected('google_forms'),
    },
    {
      provider: 'facebook',
      name: 'Meta Lead Ads (Facebook)',
      description: 'Capture leads directly from Facebook instant lead ads in under 3 seconds.',
      category: 'social',
      icon: '📱',
      connected: isConnected('facebook'),
    },
    {
      provider: 'instagram',
      name: 'Instagram Direct',
      description: 'Capture story mentions and DMs, qualifying prospects with automated intelligent replies.',
      category: 'social',
      icon: '📸',
      connected: isConnected('instagram'),
    },
  ]

  const handleCopyWebhook = () => {
    const webhookUrl = `${window.location.origin}/api/v1/public/webhook/lead`
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Plug className="w-6 h-6 text-indigo-500" />
          Channel & App Integrations
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Connect your channels to ingest leads automatically and orchestrate omnichannel follow-ups.
        </p>
      </div>

      {/* Webhook Quick Connect Banner */}
      <Card className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Universal Webhook Endpoint
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Post inbound leads from Webflow, WordPress, Zapier, Make, or custom HTML forms directly into FollowUpOS.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <code className="text-xs font-mono bg-background/80 px-3 py-1.5 rounded border">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/v1/public/webhook/lead` : '/api/v1/public/webhook/lead'}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs bg-background"
                onClick={handleCopyWebhook}
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedWebhook ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs py-1 px-2.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Live & SSL Secured
          </Badge>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrationCatalog.map((item) => {
          const connected = item.connected
          return (
            <Card key={item.provider} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-3xl">{item.icon}</div>
                  <Badge variant={connected ? 'success' : 'secondary'} className="text-[10px]">
                    {connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold mt-2">{item.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardFooter className="pt-2 border-t flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground capitalize">
                  {item.category}
                </span>

                {connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10"
                    disabled={disconnectMutation.isPending}
                    onClick={() => disconnectMutation.mutate(item.provider)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={connectMutation.isPending}
                    onClick={() => connectMutation.mutate(item.provider)}
                  >
                    Connect Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
