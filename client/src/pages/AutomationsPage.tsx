import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Zap, Plus, Play, Pause, Clock, ArrowRight, MessageSquare,
  Mail, Phone, Sparkles, CheckCircle2, AlertTriangle, Settings2, Trash2, Copy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

interface SequenceStep {
  day: number
  channel: 'email' | 'whatsapp' | 'sms'
  action: string
  template: string
}

interface AutomationSequence {
  _id: string
  name: string
  description: string
  trigger: string
  active: boolean
  stats: { enrolled: number; sent: number; replied: number; converted: number }
  steps: SequenceStep[]
}

export default function AutomationsPage() {
  const queryClient = useQueryClient()
  const [selectedSeqId, setSelectedSeqId] = useState<string>('seq-1')
  const [isCreating, setIsCreating] = useState(false)

  // Pre-configured default follow-up sequences
  const [sequences, setSequences] = useState<AutomationSequence[]>([
    {
      _id: 'seq-1',
      name: 'High-Intent Inbound Sequence',
      description: 'Triggered when a lead scores 70+ from website or social ads. Rapid multi-touch cadence.',
      trigger: 'Lead Created (Score >= 70)',
      active: true,
      stats: { enrolled: 142, sent: 398, replied: 84, converted: 31 },
      steps: [
        {
          day: 0,
          channel: 'whatsapp',
          action: 'Instant Welcome & Meeting Link',
          template: 'Hi {{name}}, thanks for reaching out to {{company}}! I saw you are looking for {{serviceRequired}}. Are you free for a quick 10-min intro call today?',
        },
        {
          day: 1,
          channel: 'email',
          action: 'Case Study & Social Proof',
          template: 'Hi {{name}}, following up on our chat yesterday. Here is how we helped a similar client achieve 3.4x ROI in under 60 days.',
        },
        {
          day: 3,
          channel: 'whatsapp',
          action: 'Value Proposition Question',
          template: 'Hey {{name}}, wanted to check if you had a chance to review the proposal? Let me know if you have any questions!',
        },
        {
          day: 7,
          channel: 'email',
          action: 'Last Check-In & Availability',
          template: 'Hi {{name}}, should I assume this project is on hold for now, or would you still like to connect this Thursday?',
        },
      ],
    },
    {
      _id: 'seq-2',
      name: 'Cold Lead Re-engagement',
      description: 'Triggered when a lead is unresponsive for 14+ days. Gentle revival touchpoints.',
      trigger: 'No response for 14 days',
      active: true,
      stats: { enrolled: 89, sent: 178, replied: 22, converted: 6 },
      steps: [
        {
          day: 0,
          channel: 'email',
          action: 'Re-open Conversation',
          template: 'Hey {{name}}, things move fast! Wanted to see if {{serviceRequired}} is still a priority for your team this quarter?',
        },
        {
          day: 5,
          channel: 'whatsapp',
          action: 'Quick Resource Share',
          template: 'Hi {{name}}, we just published our 2025 benchmark guide on {{serviceRequired}}. Thought you would find it super helpful!',
        },
      ],
    },
    {
      _id: 'seq-3',
      name: 'Post-Demo Closing Cadence',
      description: 'Triggered when pipeline stage changes to "Proposal Sent". Auto-follow-up until contract signed.',
      trigger: 'Stage changed to "Proposal Sent"',
      active: false,
      stats: { enrolled: 45, sent: 90, replied: 35, converted: 18 },
      steps: [
        {
          day: 1,
          channel: 'email',
          action: 'Proposal Summary & Next Steps',
          template: 'Hi {{name}}, attached is the custom proposal we reviewed. Looking forward to kickstarting next week!',
        },
        {
          day: 3,
          channel: 'whatsapp',
          action: 'Friendly Decision Check',
          template: 'Hey {{name}}, any feedback on the agreement from the executive team? Happy to hop on a call to clarify anything.',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            AI Follow-Up Automations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set and forget intelligent follow-up workflows that stop automatically once the prospect replies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              const newSeq: AutomationSequence = {
                _id: `seq-${Date.now()}`,
                name: 'New Custom Sequence',
                description: 'Custom automated follow-up sequence with AI personalization.',
                trigger: 'Lead Stage Updated',
                active: true,
                stats: { enrolled: 0, sent: 0, replied: 0, converted: 0 },
                steps: [
                  {
                    day: 1,
                    channel: 'email',
                    action: 'Initial Follow-up',
                    template: 'Hi {{name}}, wanted to touch base regarding your interest.',
                  },
                ],
              }
              setSequences((prev) => [newSeq, ...prev])
              setSelectedSeqId(newSeq._id)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Sequence
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active Workflows</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {sequences.filter((s) => s.active).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Leads Enrolled</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {sequences.reduce((acc, s) => acc + s.stats.enrolled, 0)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Response Rate</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {(
                  (sequences.reduce((acc, s) => acc + s.stats.replied, 0) /
                    (sequences.reduce((acc, s) => acc + s.stats.enrolled, 0) || 1)) *
                  100
                ).toFixed(1)}
                %
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Deals Converted</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {sequences.reduce((acc, s) => acc + s.stats.converted, 0)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout: Sequence List & Step Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of sequences */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sequences ({sequences.length})
          </h2>

          <div className="space-y-2">
            {sequences.map((seq) => {
              const isSelected = seq._id === currentSeq._id
              return (
                <div
                  key={seq._id}
                  onClick={() => setSelectedSeqId(seq._id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-border bg-card hover:border-border/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm text-foreground">{seq.name}</div>
                    <Badge variant={seq.active ? 'success' : 'secondary'} className="text-[10px]">
                      {seq.active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {seq.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span>{seq.steps.length} steps</span>
                    <span>{seq.stats.replied} replies ({( (seq.stats.replied / (seq.stats.enrolled || 1)) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Active Sequence Visualizer */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {currentSeq.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Trigger: <span className="font-mono text-indigo-600 dark:text-indigo-400">{currentSeq.trigger}</span>
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(currentSeq._id)}
                    className={currentSeq.active ? 'text-amber-600' : 'text-green-600'}
                  >
                    {currentSeq.active ? (
                      <>
                        <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1" /> Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Safety Rule Note */}
              <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-800 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Safety Safeguard:</strong> Follow-up sequences auto-pause immediately as soon as a lead responds via any connected channel.
                </span>
              </div>

              {/* Timeline Steps */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                {currentSeq.steps.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-indigo-600 bg-background flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    </div>

                    <div className="p-4 rounded-lg border bg-background/50 hover:bg-background transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {step.day === 0 ? 'Immediately' : `Day ${step.day}`}
                          </Badge>
                          <Badge
                            className={`text-[10px] uppercase ${
                              step.channel === 'whatsapp'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {step.channel}
                          </Badge>
                          <span className="text-xs font-semibold text-foreground">
                            {step.action}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-muted/50 text-xs text-muted-foreground font-mono leading-relaxed border">
                        {step.template}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Step Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-2 py-4 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const updated = {
                      ...currentSeq,
                      steps: [
                        ...currentSeq.steps,
                        {
                          day: (currentSeq.steps[currentSeq.steps.length - 1]?.day || 0) + 3,
                          channel: 'email' as const,
                          action: 'Follow-up Check-in',
                          template: 'Hi {{name}}, just checking in to see if you have any questions.',
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
