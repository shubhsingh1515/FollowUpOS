import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plug, CheckCircle2, XCircle, RefreshCw, ExternalLink,
  Copy, Check, AlertCircle, Sparkles, MessageCircle, Mail,
  Calendar, FormInput, Share2, Globe, ShieldCheck, Code2,
  Send, Laptop, CheckSquare, Settings2, Key, Eye, EyeOff,
  Trash2, AlertTriangle, ShieldAlert, ArrowRight, Activity,
  Layers, Terminal, HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

interface IntegrationCredentialField {
  key: string
  label: string
  placeholder: string
  required: boolean
  isSecret?: boolean
  helpText: string
}

interface IntegrationCatalogItem {
  provider: string
  name: string
  description: string
  category: string
  icon: string
  authType: string
  status: 'not_connected' | 'configuration_required' | 'connecting' | 'connected' | 'error' | 'disconnected'
  accountIdentifier?: string | null
  lastVerifiedAt?: string | null
  lastError?: { code: string; message: string; timestamp: string } | null
  maskedCredentials?: Record<string, string>
  recentDeliveries?: Array<{
    timestamp: string
    event: string
    status: 'success' | 'failed'
    statusCode: number
    payloadPreview: string
    error?: string
  }>
  requiredCredentials: IntegrationCredentialField[]
  optionalCredentials: IntegrationCredentialField[]
  documentationUrl?: string
}

export default function IntegrationsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'catalog' | 'api' | 'webhook' | 'widget'>('catalog')
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [copiedWidgetCode, setCopiedWidgetCode] = useState(false)
  const [selectedSnippet, setSelectedSnippet] = useState<'curl' | 'javascript' | 'python'>('curl')

  // Modal State
  const [activeModalProvider, setActiveModalProvider] = useState<IntegrationCatalogItem | null>(null)
  const [formCredentials, setFormCredentials] = useState<Record<string, string>>({})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  // One-time rotated key modal
  const [newlyRotatedKey, setNewlyRotatedKey] = useState<string | null>(null)

  // Widget customizer state
  const [widgetTitle, setWidgetTitle] = useState('Schedule a Free Consultation')
  const [widgetSubtitle, setWidgetSubtitle] = useState('Our AI will review your requirements and reply in under 90 seconds.')
  const [widgetButtonText, setWidgetButtonText] = useState('Request Discovery Call')
  const [askBudget, setAskBudget] = useState(true)
  const [askTimeline, setAskTimeline] = useState(true)
  const [previewSubmitted, setPreviewSubmitted] = useState(false)

  // Fetch Integrations & Developer Config
  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ['integrations-data'],
    queryFn: async () => {
      const res = await api.get('/integrations')
      return res.data.data
    },
  })

  const integrations: IntegrationCatalogItem[] = responseData?.integrations || []
  const developerConfig = responseData?.developerConfig || {}

  // Test Connection Mutation
  const testMutation = useMutation({
    mutationFn: async ({ provider, credentials }: { provider: string; credentials: Record<string, string> }) => {
      setIsTesting(true)
      setTestResult(null)
      try {
        const res = await api.post(`/integrations/${provider}/test`, { credentials })
        return res.data
      } finally {
        setIsTesting(false)
      }
    },
    onSuccess: (data) => {
      setTestResult({
        success: true,
        message: data.data?.message || 'Connection verified successfully.',
      })
    },
    onError: (err: any) => {
      setTestResult({
        success: false,
        error: err.response?.data?.error?.message || err.message || 'Failed to authenticate with provider.',
      })
    },
  })

  // Save & Connect Mutation
  const saveMutation = useMutation({
    mutationFn: async ({ provider, credentials }: { provider: string; credentials: Record<string, string> }) => {
      const res = await api.post(`/integrations/${provider}/configure`, { credentials })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-data'] })
      setActiveModalProvider(null)
      setFormCredentials({})
      setTestResult(null)
    },
    onError: (err: any) => {
      setTestResult({
        success: false,
        error: err.response?.data?.message || err.response?.data?.error?.message || 'Failed to connect integration.',
      })
    },
  })

  // Disconnect Mutation
  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await api.post(`/integrations/${provider}/disconnect`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-data'] })
      setActiveModalProvider(null)
    },
  })

  // Rotate API Key Mutation
  const rotateKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/integrations/api-key/rotate')
      return res.data.data
    },
    onSuccess: (data) => {
      setNewlyRotatedKey(data.apiKey)
      queryClient.invalidateQueries({ queryKey: ['integrations-data'] })
    },
  })

  // Revoke API Key Mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/integrations/api-key/revoke')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-data'] })
    },
  })

  // Regenerate Webhook Token Mutation
  const regenerateWebhookMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/integrations/webhook/regenerate-token')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-data'] })
    },
  })

  // Open configuration modal
  const handleOpenConfig = (item: IntegrationCatalogItem) => {
    setActiveModalProvider(item)
    setTestResult(null)
    const initial: Record<string, string> = {}
    // Pre-populate with existing masked credentials if any
    if (item.maskedCredentials) {
      Object.assign(initial, item.maskedCredentials)
    }
    setFormCredentials(initial)
  }

  const handleCopyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const webhookUrl = developerConfig.webhookUrl || 'http://localhost:5000/api/public/webhooks/leads/demo_webhook_token'
  const embedScriptCode = `<script async src="http://localhost:5000/api/public/widget.js" data-followupos-form="default_contact_form" data-theme="dark"></script>`

  // Code snippets for Developer API
  const liveApiKey = newlyRotatedKey || developerConfig.apiKey || 'fup_live_••••••••••••••••••••'
  const curlSnippet = `curl -X POST https://api.followupos.com/api/public/leads \\
  -H "Authorization: Bearer ${liveApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Rajesh Sharma",
    "email": "rajesh@techcorp.in",
    "phone": "+91 98765 12345",
    "company": "TechCorp Logistics",
    "service": "Enterprise Sales Automation",
    "budget": "₹3L - ₹10L",
    "message": "Looking to automate our advisory follow-up for 20 reps immediately."
  }'`

  const jsSnippet = `const response = await fetch('https://api.followupos.com/api/public/leads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${liveApiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Rajesh Sharma',
    email: 'rajesh@techcorp.in',
    phone: '+91 98765 12345',
    company: 'TechCorp Logistics',
    service: 'Enterprise Sales Automation',
    budget: '₹3L - ₹10L',
    message: 'Looking to automate our advisory follow-up for 20 reps immediately.'
  })
});
const data = await response.json();
console.log('Lead queued:', data.data.leadId);`

  const pythonSnippet = `import requests

url = "https://api.followupos.com/api/public/leads"
headers = {
    "Authorization": "Bearer ${liveApiKey}",
    "Content-Type": "application/json"
}
payload = {
    "name": "Rajesh Sharma",
    "email": "rajesh@techcorp.in",
    "phone": "+91 98765 12345",
    "company": "TechCorp Logistics",
    "service": "Enterprise Sales Automation",
    "budget": "₹3L - ₹10L",
    "message": "Looking to automate our advisory follow-up for 20 reps immediately."
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`

  return (
    <div className="p-4 lg:p-6 animate-fade-in space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Plug className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Integrations & Inbound Lead Hub
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect external communication channels, configure REST API keys, and monitor verified webhook ingestions.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex rounded-xl border border-border/70 p-1 bg-muted/40">
          <button
            onClick={() => setActiveTab('catalog')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
              activeTab === 'catalog' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Channels ({integrations.length})
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
              activeTab === 'api' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            Developer API
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
              activeTab === 'webhook' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            Inbound Webhook
          </button>
          <button
            onClick={() => setActiveTab('widget')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
              activeTab === 'widget' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Embed Form
          </button>
        </div>
      </div>

      {/* TAB 1: Real Channel Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((item) => {
              const isConnected = item.status === 'connected'
              const isError = item.status === 'error'

              return (
                <Card
                  key={item.provider}
                  className={cn(
                    "flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-border/80 bg-card/60 backdrop-blur-sm",
                    isConnected && "border-emerald-500/30 bg-emerald-500/[0.02]",
                    isError && "border-rose-500/30 bg-rose-500/[0.02]"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-3xl p-2.5 rounded-2xl bg-muted/60 border border-border/50 shadow-inner">
                        {item.icon}
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5",
                          isConnected && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
                          isError && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
                          !isConnected && !isError && "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {isConnected && "● Verified"}
                        {isError && "✕ Failed"}
                        {!isConnected && !isError && "Not Connected"}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold mt-3 text-foreground">{item.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed text-muted-foreground">
                      {item.description}
                    </CardDescription>

                    {/* Connected Account & Last Verified Details */}
                    {isConnected && (
                      <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Account:</span>
                          <span className="font-medium text-foreground font-mono truncate max-w-[170px]">
                            {item.accountIdentifier || 'Connected'}
                          </span>
                        </div>
                        {item.lastVerifiedAt && (
                          <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                            <span>Verified:</span>
                            <span className="font-mono">
                              {new Date(item.lastVerifiedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Display */}
                    {isError && item.lastError && (
                      <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-300">
                        <p className="font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Connection Error:
                        </p>
                        <p className="text-[10px] mt-0.5 leading-tight">{item.lastError.message}</p>
                      </div>
                    )}
                  </CardHeader>

                  <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 border-border text-foreground hover:bg-muted"
                            onClick={() => handleOpenConfig(item)}
                          >
                            <Settings2 className="w-3.5 h-3.5 mr-1" />
                            Manage
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                            onClick={() => disconnectMutation.mutate(item.provider)}
                            disabled={disconnectMutation.isPending}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                          onClick={() => handleOpenConfig(item)}
                        >
                          Configure & Connect
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Developer REST API Management */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-border/80 shadow-md">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Key className="w-4 h-4 text-amber-500" />
                    Organization Bearer API Key
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Authenticate high-velocity lead ingestion from custom web applications, Zapier, mobile apps, or backend servers.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                    onClick={() => {
                      if (confirm('Are you sure you want to revoke this API Key? Inbound scripts using it will immediately receive 401 Unauthorized.')) {
                        revokeKeyMutation.mutate()
                      }
                    }}
                    disabled={revokeKeyMutation.isPending}
                  >
                    Revoke Key
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
                    onClick={() => rotateKeyMutation.mutate()}
                    disabled={rotateKeyMutation.isPending}
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", rotateKeyMutation.isPending && "animate-spin")} />
                    Rotate Key
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* API Key Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>LIVE PRODUCTION API KEY</span>
                  {developerConfig.apiKeyCreatedAt && (
                    <span className="font-mono text-[10px]">
                      Created: {new Date(developerConfig.apiKeyCreatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs bg-muted/80 px-4 py-2.5 rounded-xl border border-border flex-1 flex items-center justify-between">
                    <span className="text-foreground tracking-wider select-all font-semibold">
                      {liveApiKey}
                    </span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[9px] font-mono">
                      AES-256 SECURED
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 text-xs gap-1.5 px-4"
                    onClick={() => handleCopyText(liveApiKey, setCopiedKey)}
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Your secret key is never stored in plaintext and is protected with tenant-level AES-256 encryption.
                </p>
              </div>

              {/* Code Examples */}
              <div className="space-y-3 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-500" />
                    Quickstart Ingestion Request Examples
                  </span>

                  <div className="flex rounded-lg border border-border p-0.5 bg-muted/40">
                    <button
                      onClick={() => setSelectedSnippet('curl')}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition-colors",
                        selectedSnippet === 'curl' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setSelectedSnippet('javascript')}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition-colors",
                        selectedSnippet === 'javascript' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      Node.js / JS
                    </button>
                    <button
                      onClick={() => setSelectedSnippet('python')}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition-colors",
                        selectedSnippet === 'python' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      Python
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-xl bg-[#0B0D13] border border-white/[0.08] text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed select-all">
                    {selectedSnippet === 'curl' && curlSnippet}
                    {selectedSnippet === 'javascript' && jsSnippet}
                    {selectedSnippet === 'python' && pythonSnippet}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyText(
                      selectedSnippet === 'curl' ? curlSnippet : selectedSnippet === 'javascript' ? jsSnippet : pythonSnippet,
                      setCopiedKey
                    )}
                    className="absolute top-3 right-3 h-7 text-[10px] text-zinc-400 hover:text-white bg-white/5"
                  >
                    <Copy className="w-3 h-3 mr-1" /> Copy Snippet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Universal Inbound Webhook & Delivery Audit */}
      {activeTab === 'webhook' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-border/80 shadow-md">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Universal Inbound Lead Webhook
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Direct endpoint for Make.com, Zapier, Typeform, Webflow forms, or HubSpot webhooks.
                  </CardDescription>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  onClick={() => {
                    if (confirm('Regenerating this webhook token will invalidate the previous URL. Are you sure?')) {
                      regenerateWebhookMutation.mutate()
                    }
                  }}
                  disabled={regenerateWebhookMutation.isPending}
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", regenerateWebhookMutation.isPending && "animate-spin")} />
                  Regenerate Webhook Secret
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground">YOUR SECURE WEBHOOK URL (POST)</span>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs bg-muted/80 px-4 py-2.5 rounded-xl border border-border flex-1 select-all text-foreground font-semibold">
                    {webhookUrl}
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 text-xs gap-1.5 px-4"
                    onClick={() => handleCopyText(webhookUrl, setCopiedWebhook)}
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedWebhook ? 'Copied' : 'Copy URL'}
                  </Button>
                </div>
              </div>

              {/* Webhook Deliveries Table */}
              <div className="space-y-3 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Recent Webhook Deliveries & Status</span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Auto-Deduplication Enabled
                  </Badge>
                </div>

                <div className="rounded-xl border border-border/70 overflow-hidden bg-card/50">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 text-muted-foreground text-[11px] font-semibold border-b border-border/60">
                      <tr>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Event</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Payload Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">Just now</td>
                        <td className="py-2.5 px-3 font-medium text-foreground">inbound_form_lead</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> 200 OK
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                          &#123;"name": "Vikram Malhotra", "email": "vikram@malhotracapital.com"&#125;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: Embeddable Website Widget */}
      {activeTab === 'widget' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-border/80 shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-500" />
                  Lead Capture Form Customizer
                </CardTitle>
                <CardDescription className="text-xs">
                  Generate an embeddable lead capture form or modal with instant AI qualification for your agency website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Headline Title</label>
                  <Input
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Subtitle / Guarantee</label>
                  <Input
                    value={widgetSubtitle}
                    onChange={(e) => setWidgetSubtitle(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">CTA Button Label</label>
                  <Input
                    value={widgetButtonText}
                    onChange={(e) => setWidgetButtonText(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="pt-3 border-t border-border/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Embed Script (HTML / Next.js / Webflow)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyText(embedScriptCode, setCopiedWidgetCode)}
                      className="h-6 text-[11px] gap-1"
                    >
                      {copiedWidgetCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedWidgetCode ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/80 font-mono text-[11px] rounded-xl border border-border select-all text-muted-foreground">
                    {embedScriptCode}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                      Our sales AI copilot has received your details and queued an instant reply.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setPreviewSubmitted(false)} className="text-xs h-7 mt-2">
                      Reset Demo Form
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setPreviewSubmitted(true)
                    }}
                    className="space-y-3"
                  >
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium">Full Name</label>
                      <Input placeholder="e.g. Vikram Malhotra" required className="text-xs h-8 bg-background" defaultValue="Vikram Malhotra" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium">Work Email / WhatsApp</label>
                      <Input placeholder="vikram@malhotracapital.com" required className="text-xs h-8 bg-background" defaultValue="vikram@malhotracapital.com" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium">Service Required</label>
                      <Input placeholder="e.g. Performance Marketing, CRM Setup" required className="text-xs h-8 bg-background" defaultValue="Advisory CRM Follow-up Automation" />
                    </div>

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

      {/* MODAL: Real Configuration & Test Connection */}
      {activeModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="text-2xl p-2 rounded-xl bg-muted border border-border/50">
                  {activeModalProvider.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Configure {activeModalProvider.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Authenticate your credentials with AES-256 encrypted storage.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalProvider(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1.5 rounded-lg hover:bg-muted"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Security notice */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tenant-Isolated & Encrypted:</span> All credentials are encrypted using AES-256-GCM before database storage and are never exposed to clients or shared between workspaces.
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5">
                {activeModalProvider.requiredCredentials.map((field) => {
                  const isSecret = field.isSecret
                  const isVisible = showSecrets[field.key]

                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          {field.label}
                          <span className="text-rose-500 font-bold">*</span>
                        </label>
                        {isSecret && (
                          <button
                            type="button"
                            onClick={() => setShowSecrets(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                          >
                            {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {isVisible ? 'Hide' : 'Show'}
                          </button>
                        )}
                      </div>

                      <Input
                        type={isSecret && !isVisible ? 'password' : 'text'}
                        placeholder={field.placeholder}
                        value={formCredentials[field.key] || ''}
                        onChange={(e) => setFormCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="text-xs h-9 bg-background font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground leading-tight">{field.helpText}</p>
                    </div>
                  )
                })}

                {activeModalProvider.optionalCredentials?.map((field) => (
                  <div key={field.key} className="space-y-1 pt-1">
                    <label className="text-xs font-semibold text-foreground">
                      {field.label} <span className="text-muted-foreground text-[10px] font-normal">(Optional)</span>
                    </label>
                    <Input
                      placeholder={field.placeholder}
                      value={formCredentials[field.key] || ''}
                      onChange={(e) => setFormCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="text-xs h-9 bg-background font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground leading-tight">{field.helpText}</p>
                  </div>
                ))}
              </div>

              {/* Test Connection Result Alert */}
              {testResult && (
                <div
                  className={cn(
                    "p-3 rounded-xl text-xs flex items-start gap-2 animate-fade-in",
                    testResult.success
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300"
                  )}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{testResult.success ? 'Authentication Succeeded' : 'Authentication Failed'}</p>
                    <p className="text-[11px] mt-0.5">{testResult.message || testResult.error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => testMutation.mutate({ provider: activeModalProvider.provider, credentials: formCredentials })}
                disabled={isTesting || saveMutation.isPending}
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => setActiveModalProvider(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  onClick={() => saveMutation.mutate({ provider: activeModalProvider.provider, credentials: formCredentials })}
                  disabled={saveMutation.isPending || isTesting}
                >
                  {saveMutation.isPending ? 'Encrypting & Saving...' : 'Save & Connect'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROTATED KEY MODAL: One-Time Secret Alert */}
      {newlyRotatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Save Your New API Key</h3>
                <p className="text-xs text-muted-foreground">This secret will only be shown once in full.</p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-xl border border-border font-mono text-xs select-all break-all text-amber-600 dark:text-amber-400 font-semibold">
              {newlyRotatedKey}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Please copy and store this API key in your environment secrets manager. Once you close this modal, the key will be masked permanently.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => handleCopyText(newlyRotatedKey, setCopiedKey)}
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copiedKey ? 'Copied' : 'Copy Key'}
              </Button>
              <Button
                size="sm"
                className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                onClick={() => setNewlyRotatedKey(null)}
              >
                I Have Saved It
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
