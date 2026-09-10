import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Zap, Plus, Play, Pause, Clock, ArrowRight, MessageSquare,
  Mail, Phone, Sparkles, CheckCircle2, AlertTriangle, Settings2,
  Trash2, Copy, Sliders, ShieldCheck, Flame, Send, Eye, Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

interface SequenceStep {
  id: string
  day: number
  channel: 'whatsapp' | 'email' | 'sms'
  action: string
  template: string
  condition?: string
}

interface AutomationSequence {
  _id: string
  name: string
  description: string
  trigger: string
  condition: string
  active: boolean
  stats: { enrolled: number; sent: number; replied: number; converted: number }
  steps: SequenceStep[]
}

const VARIABLE_PILLS = [
  { label: 'Lead Name', token: '{{name}}' },
  { label: 'Company', token: '{{company}}' },
  { label: 'Service', token: '{{service}}' },
  { label: 'Meeting Link', token: '{{meeting_link}}' },
  { label: 'Salesperson', token: '{{salesperson}}' },
]

export default function AutomationsPage() {
  const [selectedSeqId, setSelectedSeqId] = useState<string>('seq-1')
  const [activeTab, setActiveTab] = useState<'builder' | 'safety' | 'campaigns'>('builder')
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(0)
  const [testSimulating, setTestSimulating] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  // Safety settings state
  const [safetyRules, setSafetyRules] = useState({
    pauseOnReply: true,
    pauseOnMeeting: true,
    pauseOnObjection: true,
    respectBusinessHours: true,
    noWeekendMessages: true,
    maxTouchesPerLead: 5,
  })

  // Sequences list
  const [sequences, setSequences] = useState<AutomationSequence[]>([
    {
      _id: 'seq-1',
      name: 'High-Intent Inbound Sequence',
      description: 'Triggered when lead score >= 70. Rapid multi-channel outreach within 5 minutes.',
      trigger: 'Lead Created (Score >= 70)',
      condition: 'Intent == "High" AND Phone Verified',
      active: true,
      stats: { enrolled: 142, sent: 398, replied: 84, converted: 31 },
      steps: [
        {
          id: 's1',
          day: 0,
          channel: 'whatsapp',
          action: 'Instant WhatsApp Welcome & Cal Link',
          template: 'Hi {{name}}, thanks for requesting details on {{service}} from {{company}}! Are you free for a quick 10-minute discovery call today? You can grab a slot here: {{meeting_link}}',
          condition: 'Sent within 5 min of inquiry',
        },
        {
          id: 's2',
          day: 1,
          channel: 'email',
          action: 'Case Study & Proof Of Work',
          template: 'Hi {{name}}, following up on my earlier WhatsApp. Thought you would like to see how we delivered 3.4x ROI for a similar client in under 60 days. Attached the brief case study.',
          condition: 'If no reply to WhatsApp within 24h',
        },
        {
          id: 's3',
          day: 3,
          channel: 'whatsapp',
          action: 'Value Proposition Question',
          template: 'Hey {{name}}, wanted to check if you had a chance to review the materials? Happy to address any questions on implementation timeline.',
          condition: 'If still uncontacted',
        },
        {
          id: 's4',
          day: 7,
          channel: 'email',
          action: 'Permission to Close / Final Check-in',
          template: 'Hi {{name}}, should I assume this project is on hold for this quarter, or would you still like to connect later this week? - {{salesperson}}',
          condition: 'Final attempt before stage -> Inactive',
        },
      ],
    },
    {
      _id: 'seq-2',
      name: 'Cold Lead Revival Cadence',
      description: 'Revives leads that went dark 14+ days ago with value-first benchmark insights.',
      trigger: 'No response for 14 days',
      condition: 'Stage != "Won" AND Stage != "Lost"',
      active: true,
      stats: { enrolled: 89, sent: 178, replied: 22, converted: 6 },
      steps: [
        {
          id: 's21',
          day: 0,
          channel: 'email',
          action: 'Quarterly Priority Check-in',
          template: 'Hey {{name}}, things move fast! Wanted to check if {{service}} is still a priority for {{company}} this quarter?',
        },
        {
          id: 's22',
          day: 5,
          channel: 'whatsapp',
          action: 'Benchmark Report Share',
          template: 'Hi {{name}}, we just released our new performance benchmarks for {{service}}. Thought you would find page 4 especially relevant!',
        },
      ],
    },
    {
      _id: 'seq-3',
      name: 'Post-Proposal Closing Cadence',
      description: 'Triggered when pipeline stage changes to "Proposal Sent". Auto-follow-up until signed.',
      trigger: 'Stage changed to "Proposal Sent"',
      condition: 'Proposal Age > 48 hours without signature',
      active: false,
      stats: { enrolled: 45, sent: 90, replied: 35, converted: 18 },
      steps: [
        {
          id: 's31',
          day: 1,
          channel: 'email',
          action: 'Executive Summary & Next Steps',
          template: 'Hi {{name}}, attached is the custom proposal we walked through. Looking forward to kickstarting next week!',
        },
        {
          id: 's32',
          day: 3,
          channel: 'whatsapp',
          action: 'Stakeholder Feedback Check',
          template: 'Hey {{name}}, any feedback or questions from the leadership team? Happy to jump on a 5-min call if needed.',
        },
      ],
    },
  ])

  const currentSeq = sequences.find((s) => s._id === selectedSeqId) || sequences[0]

  const toggleStatus = (id: string) => {
    setSequences((prev) =>
      prev.map((s) => (s._id === id ? { ...s, active: !s.active } : s))
    )
  }

  const updateStepTemplate = (index: number, template: string) => {
    const updatedSteps = [...currentSeq.steps]
    updatedSteps[index].template = template
    setSequences((prev) =>
      prev.map((s) => (s._id === currentSeq._id ? { ...s, steps: updatedSteps } : s))
    )
  }

  const insertToken = (index: number, token: string) => {
    const step = currentSeq.steps[index]
    updateStepTemplate(index, (step.template || '') + ' ' + token)
  }

  const handleTestSimulation = () => {
    setTestSimulating(true)
    setTestSuccess(false)
    setTimeout(() => {
      setTestSimulating(false)
      setTestSuccess(true)
      setTimeout(() => setTestSuccess(false), 4000)
    }, 1200)
  }

  return (
    <div className="p-4 lg:p-6 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            AI Follow-Up Automations & Cadences
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visual trigger-condition-action workflow builder with intelligent auto-pause safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1 bg-muted/30">
            <button
              onClick={() => setActiveTab('builder')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                activeTab === 'builder' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Workflow Builder
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                activeTab === 'safety' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Auto-Pause Rules
            </button>
          </div>

          <Button
            onClick={() => {
              const newSeq: AutomationSequence = {
                _id: `seq-${Date.now()}`,
                name: 'Custom Service Cadence',
                description: 'Custom trigger-based automated follow-up sequence with AI personalization.',
                trigger: 'Pipeline Stage == "Contacted"',
                condition: 'Lead Score >= 50',
                active: true,
                stats: { enrolled: 0, sent: 0, replied: 0, converted: 0 },
                steps: [
                  {
                    id: `s-${Date.now()}`,
                    day: 1,
                    channel: 'whatsapp',
                    action: 'Introductory Check-in',
                    template: 'Hi {{name}}, wanted to touch base regarding {{service}} for {{company}}!',
                    condition: 'Within business hours',
                  },
                ],
              }
              setSequences((prev) => [newSeq, ...prev])
              setSelectedSeqId(newSeq._id)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Safety Rules Tab */}
      {activeTab === 'safety' && (
        <Card className="border-border/70 shadow-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Automated Follow-Up Safety & Compliance Rules
            </CardTitle>
            <CardDescription className="text-xs">
              Strict rules to prevent spamming leads, sounding robotic, or interrupting active negotiations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: 'pauseOnReply',
                  title: 'Auto-Pause on Lead Response',
                  desc: 'Instantly halts all cadence messages across all channels as soon as the lead sends an inbound WhatsApp, SMS, or Email.',
                  active: safetyRules.pauseOnReply,
                },
                {
                  key: 'pauseOnMeeting',
                  title: 'Auto-Pause on Meeting Scheduled',
                  desc: 'Cancels subsequent reminders once Calendly/Google Meet webhook confirms an appointment on the sales calendar.',
                  active: safetyRules.pauseOnMeeting,
                },
                {
                  key: 'pauseOnObjection',
                  title: 'Auto-Pause on Tough Objection Detected',
                  desc: 'If AI sentiment flags "not interested" or budget veto, moves lead to human review instead of continuing automated touches.',
                  active: safetyRules.pauseOnObjection,
                },
                {
                  key: 'respectBusinessHours',
                  title: 'Strict Business Hours (9 AM – 7 PM IST)',
                  desc: 'Queues outreach during night hours so messages arrive during peak working hours, maximizing response rates.',
                  active: safetyRules.respectBusinessHours,
                },
                {
                  key: 'noWeekendMessages',
                  title: 'Mute Weekend Outreach',
                  desc: 'Holds Saturday and Sunday follow-ups until Monday 10:00 AM IST for professional high-ticket service positioning.',
                  active: safetyRules.noWeekendMessages,
                },
              ].map((rule) => (
                <div
                  key={rule.key}
                  onClick={() => setSafetyRules(prev => ({ ...prev, [rule.key]: !prev[rule.key as keyof typeof safetyRules] }))}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3',
                    rule.active ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-muted/20 opacity-70'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{rule.title}</span>
                      <Badge variant="outline" className={rule.active ? 'text-emerald-600 bg-emerald-500/10 text-[10px]' : 'text-[10px]'}>
                        {rule.active ? 'Enforced' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rule.desc}</p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border',
                    rule.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border'
                  )}>
                    {rule.active && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Builder Tab */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Workflows */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Sequences ({sequences.length})
            </h2>

            <div className="space-y-2.5">
              {sequences.map((seq) => {
                const isSelected = seq._id === currentSeq._id
                return (
                  <div
                    key={seq._id}
                    onClick={() => setSelectedSeqId(seq._id)}
                    className={cn(
                      'p-4 rounded-xl border cursor-pointer transition-all duration-200',
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md ring-1 ring-indigo-600/30'
                        : 'border-border bg-card hover:border-border/90'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-foreground">{seq.name}</div>
                      <Badge variant={seq.active ? 'outline' : 'secondary'} className={seq.active ? 'text-emerald-600 border-emerald-500/30 text-[10px]' : 'text-[10px]'}>
                        {seq.active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {seq.description}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50 text-[11px] text-muted-foreground font-mono">
                      <span>{seq.steps.length} Cadence Steps</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {Math.round((seq.stats.replied / (seq.stats.enrolled || 1)) * 100)}% Reply Rate
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Interactive Canvas & Step Visualizer */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {currentSeq.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Trigger Event: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{currentSeq.trigger}</span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestSimulation}
                      disabled={testSimulating}
                      className="text-xs h-8 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
                    >
                      {testSimulating ? (
                        <Clock className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : testSuccess ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      ) : (
                        <Play className="w-3.5 h-3.5 mr-1" />
                      )}
                      {testSuccess ? 'Simulation Passed' : 'Test Flow'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(currentSeq._id)}
                      className={cn('text-xs h-8', currentSeq.active ? 'text-amber-600 border-amber-500/30' : 'text-emerald-600 border-emerald-500/30')}
                    >
                      {currentSeq.active ? (
                        <>
                          <Pause className="w-3.5 h-3.5 mr-1" /> Pause Cadence
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 mr-1" /> Resume Cadence
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Visual Flow Canvas Node Header */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Node Visualizer Pipeline
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                    <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold">
                      TRIGGER: {currentSeq.trigger}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-semibold">
                      CONDITION: {currentSeq.condition}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold">
                      EXECUTE: {currentSeq.steps.length} Cadence Steps
                    </div>
                  </div>
                </div>

                {/* Steps List */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                  {currentSeq.steps.map((step, idx) => (
                    <div key={step.id || idx} className="relative group">
                      <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-indigo-600 bg-background flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      </div>

                      <div className="p-4 rounded-xl border border-border/80 bg-background hover:border-indigo-500/50 transition-all space-y-3 shadow-sm">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                              {step.day === 0 ? 'Day 0 (Instant)' : `Day +${step.day}`}
                            </Badge>
                            <Badge
                              className={cn(
                                'text-[10px] uppercase font-bold tracking-wider',
                                step.channel === 'whatsapp'
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                                  : 'bg-blue-600 text-white hover:bg-blue-600'
                              )}
                            >
                              {step.channel}
                            </Badge>
                            <span className="text-xs font-bold text-foreground">
                              {step.action}
                            </span>
                          </div>

                          {step.condition && (
                            <span className="text-[10px] text-muted-foreground italic font-mono bg-muted px-2 py-0.5 rounded">
                              {step.condition}
                            </span>
                          )}
                        </div>

                        {/* Template Editor */}
                        <div className="space-y-2">
                          <Textarea
                            value={step.template}
                            onChange={(e) => updateStepTemplate(idx, e.target.value)}
                            rows={3}
                            className="text-xs font-mono resize-none bg-muted/20 border-border/60"
                          />

                          {/* Variable Insertion Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-muted-foreground font-semibold">Insert Token:</span>
                            {VARIABLE_PILLS.map((pill) => (
                              <button
                                key={pill.token}
                                type="button"
                                onClick={() => insertToken(idx, pill.token)}
                                className="text-[10px] bg-muted hover:bg-accent border border-border px-2 py-0.5 rounded text-muted-foreground hover:text-foreground transition-colors font-mono"
                              >
                                {pill.token}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Step Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-2 py-4 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50"
                  onClick={() => {
                    const nextDay = (currentSeq.steps[currentSeq.steps.length - 1]?.day || 0) + 3
                    const updated = {
                      ...currentSeq,
                      steps: [
                        ...currentSeq.steps,
                        {
                          id: `step-${Date.now()}`,
                          day: nextDay,
                          channel: (nextDay % 2 === 0 ? 'whatsapp' : 'email') as any,
                          action: 'Mid-cadence Value Check',
                          template: 'Hi {{name}}, wanted to share one more quick insight regarding {{service}} before our demo slot.',
                          condition: 'If unreplied',
                        },
                      ],
                    }
                    setSequences((prev) =>
                      prev.map((s) => (s._id === currentSeq._id ? updated : s))
                    )
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Cadence Step
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
