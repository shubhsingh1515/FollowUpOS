import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings, Building2, Bot, Bell, Shield, Key,
  Save, Check, Sparkles, Clock, Globe, MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'agent' | 'org' | 'notifications' | 'api'>('agent')
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Fetch organization settings
  const { data: orgData, isLoading } = useQuery({
    queryKey: ['org-settings'],
    queryFn: async () => {
      const res = await api.get('/settings/organization')
      return res.data.data.organization || {}
    },
  })

  // State for form fields
  const [formState, setFormState] = useState({
    name: '',
    industry: '',
    agentName: 'Sophia',
    agentTone: 'professional',
    autoFollowUpEnabled: true,
    qualificationThreshold: 65,
    businessHoursStart: '09:00',
    businessHoursEnd: '18:00',
    timezone: 'UTC',
  })

  useEffect(() => {
    if (orgData) {
      setFormState({
        name: orgData.name || '',
        industry: orgData.industry || 'service_business',
        agentName: orgData.settings?.agentName || 'Sophia',
        agentTone: orgData.settings?.agentTone || 'professional',
        autoFollowUpEnabled: orgData.settings?.autoFollowUpEnabled ?? true,
        qualificationThreshold: orgData.settings?.qualificationThreshold || 65,
        businessHoursStart: orgData.settings?.businessHoursStart || '09:00',
        businessHoursEnd: orgData.settings?.businessHoursEnd || '18:00',
        timezone: orgData.timezone || 'UTC',
      })
    }
  }, [orgData])

  // Update org mutation
  const updateMutation = useMutation({
    mutationFn: async (updated: any) => {
      return api.patch('/settings/organization', {
        name: updated.name,
        industry: updated.industry,
        timezone: updated.timezone,
        settings: {
          agentName: updated.agentName,
          agentTone: updated.agentTone,
          autoFollowUpEnabled: updated.autoFollowUpEnabled,
          qualificationThreshold: updated.qualificationThreshold,
          businessHoursStart: updated.businessHoursStart,
          businessHoursEnd: updated.businessHoursEnd,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-settings'] })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    },
  })

  const handleSave = () => {
    updateMutation.mutate(formState)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            Workspace Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your AI sales agent behavior, organization profile, and notification rules.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" /> Saved Successfully
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-border space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('agent')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'agent'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bot className="w-4 h-4" /> AI Sales Agent
        </button>
        <button
          onClick={() => setActiveTab('org')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'org'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" /> Organization Profile
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'api'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key className="w-4 h-4" /> API Keys & Webhooks
        </button>
      </div>

      {/* Tab: AI Sales Agent */}
      {activeTab === 'agent' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Agent Personality & Identity
              </CardTitle>
              <CardDescription className="text-xs">
                How your AI representative introduces itself to inbound prospects and writes follow-ups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Agent Persona Name</label>
                  <Input
                    value={formState.agentName}
                    onChange={(e) => setFormState({ ...formState, agentName: e.target.value })}
                    className="mt-1.5 text-xs"
                    placeholder="e.g. Sophia, Alex"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Leads will receive messages signed by this representative name.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Communication Tone</label>
                  <select
                    value={formState.agentTone}
                    onChange={(e) => setFormState({ ...formState, agentTone: e.target.value })}
                    className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs"
                  >
                    <option value="professional">Professional & Consultative</option>
                    <option value="friendly">Friendly & Warm</option>
                    <option value="direct">Direct & High-Energy</option>
                    <option value="executive">Executive & Formal</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Controls vocabulary, greetings, and closing signatures generated by the AI.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Autonomous Execution & Guardrails</CardTitle>
              <CardDescription className="text-xs">
                Configure safety boundaries and operational parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Automated Drip Follow-ups
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Automatically dispatch multi-touch sequences when a prospect goes silent.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formState.autoFollowUpEnabled}
                  onChange={(e) =>
                    setFormState({ ...formState, autoFollowUpEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Minimum Qualification Score (0 - 100)
                  </label>
                  <Input
                    type="number"
                    value={formState.qualificationThreshold}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        qualificationThreshold: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1.5 text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Only leads with scores at or above this value get routed to human reps.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Business Working Hours
                  </label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      type="time"
                      value={formState.businessHoursStart}
                      onChange={(e) =>
                        setFormState({ ...formState, businessHoursStart: e.target.value })
                      }
                      className="text-xs"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={formState.businessHoursEnd}
                      onChange={(e) =>
                        setFormState({ ...formState, businessHoursEnd: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    No WhatsApp or SMS will be sent outside these hours to prevent bothering leads.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Organization */}
      {activeTab === 'org' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Information</CardTitle>
            <CardDescription className="text-xs">
              Basic company details and timezone setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Company / Agency Name</label>
                <Input
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="mt-1.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Industry</label>
                <select
                  value={formState.industry}
                  onChange={(e) => setFormState({ ...formState, industry: e.target.value })}
                  className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="digital_marketing_agency">Digital Marketing Agency</option>
                  <option value="real_estate">Real Estate & Brokerage</option>
                  <option value="consulting">Consulting & Advisory</option>
                  <option value="software_development">Software / IT Services</option>
                  <option value="home_services">Home Services / Contracting</option>
                  <option value="other">Other Service Business</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Workspace Timezone</label>
                <select
                  value={formState.timezone}
                  onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                  className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT / BST)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Triggers</CardTitle>
            <CardDescription className="text-xs">
              Choose when and how your team gets alerted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'Hot Lead Detected (Score >= 75)', desc: 'Instant push alert when a high-intent prospect submits.' },
              { title: 'Lead Replied to Follow-up', desc: 'Alert assigned sales rep immediately when prospect replies.' },
              { title: 'Follow-up Overdue Reminder', desc: 'Daily morning digest of scheduled follow-ups needing manual attention.' },
              { title: 'Weekly Performance Report', desc: 'Summary of win rates, leads closed, and AI efficiency metrics.' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div>
                  <div className="text-xs font-medium text-foreground">{item.title}</div>
                  <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tab: API Keys */}
      {activeTab === 'api' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Developer API & Webhooks</CardTitle>
            <CardDescription className="text-xs">
              Programmatically submit leads or listen to pipeline events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">API Secret Key</label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  type="password"
                  readOnly
                  value="fuos_live_98ab42c90f2390a184e7239"
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="sm" onClick={() => alert('API key copied to clipboard')}>
                  Copy
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Keep this key secret. Never commit it to client-side code repositories.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
