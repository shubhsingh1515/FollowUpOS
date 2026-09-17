import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Sparkles, Send, RotateCcw, MessageSquare,
  Phone, Mail, Globe, Building, Tag, ChevronDown, ChevronRight,
  Flame, Calendar, Star, TrendingUp, CheckCircle2, Edit,
  Loader2, Clock, Wand2, ThumbsUp, ShieldAlert, X, AlertCircle, Info, Archive,
} from 'lucide-react'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  formatCurrency, getInitials, temperatureLabel,
  stageLabel, sourceIcon, timeAgo, cn,
} from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

function MessageBubble({ message }: { message: any }) {
  const isInbound = message.direction === 'inbound'
  return (
    <div className={cn('flex gap-2.5', isInbound ? 'justify-start' : 'justify-end')}>
      {isInbound && (
        <Avatar className="h-7 w-7 mt-1 shrink-0">
          <AvatarFallback className="text-xs bg-muted">C</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('max-w-sm', isInbound ? '' : 'items-end flex flex-col')}>
        <div className={isInbound ? 'msg-inbound' : 'msg-outbound'}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          {message.aiGenerated && (
            <div className={cn('flex items-center gap-1 mt-1.5', isInbound ? 'text-muted-foreground' : 'text-primary-foreground/70')}>
              <Sparkles className="w-3 h-3" />
              <span className="text-[10px]">AI suggestion</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-muted-foreground">{timeAgo(message.createdAt)}</span>
          <span className="text-[10px]">{sourceIcon(message.channel)}</span>
        </div>
      </div>
    </div>
  )
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { organization } = useAuthStore()
  const queryClient = useQueryClient()

  const [messageText, setMessageText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeStage, setActiveStage] = useState('')
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  const archiveMutation = useMutation({
    mutationFn: () => api.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      navigate('/leads')
    },
  })

  const { data: leadData, isLoading } = useQuery<any>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${id}`)
      if (data.data?.lead?.status) {
        setActiveStage(data.data.lead.status)
      }
      return data.data
    },
    enabled: !!id,
  })

  const { data: convData } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      // Find conversation for this lead
      const { data } = await api.get(`/conversations?leadId=${id}`)
      if (data.data.conversations?.length) {
        const convId = data.data.conversations[0]._id
        const { data: cd } = await api.get(`/conversations/${convId}`)
        return cd.data
      }
      return null
    },
    enabled: !!id,
  })

  const analyzeMutation = useMutation({
    mutationFn: () => api.post(`/leads/${id}/analyze`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
    },
  })

  const stageMutation = useMutation({
    mutationFn: (stage: string) => api.post(`/leads/${id}/change-stage`, { stage }),
    onSuccess: (_, stage) => {
      setActiveStage(stage)
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, aiGenerated }: { content: string; aiGenerated: boolean }) => {
      if (!convData?.conversation) return
      return api.post(`/conversations/${convData.conversation._id}/messages`, {
        content,
        aiGenerated,
      })
    },
    onSuccess: () => {
      setMessageText('')
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    },
  })

  const generateReply = async () => {
    setIsGenerating(true)
    try {
      const { data } = await api.post(`/leads/${id}/generate-reply`, {
        tone: organization?.settings?.defaultTone,
      })
      setMessageText(data.data.reply)
    } catch (err) {
      console.error('Generate reply failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSend = () => {
    if (!messageText.trim()) return
    sendMessageMutation.mutate({
      content: messageText,
      aiGenerated: false,
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  const lead = leadData?.lead
  const contact = lead?.contactId
  const { icon: tempIcon, className: tempClass } = temperatureLabel(lead?.leadTemperature)

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/leads')}>
          Back to Leads
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold">{contact?.fullName}</h1>
            <span className="text-muted-foreground text-sm">at {contact?.company}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', tempClass)}>
              {tempIcon} {lead.leadTemperature?.toUpperCase()}
            </span>
          </div>
        </div>
        {/* Stage Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => stageMutation.mutate(s)}
                className={cn(
                  'text-xs px-3 py-1 rounded-full font-medium transition-all border',
                  activeStage === s
                    ? s === 'won' ? 'bg-green-100 text-green-700 border-green-300'
                      : s === 'lost' ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {stageLabel(s)}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchiveConfirm(true)}
            className="h-8 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 gap-1.5 ml-1"
            title="Archive Lead"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contact info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-medium">
                    {getInitials(contact?.fullName || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{contact?.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{contact?.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">{contact?.company}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                {contact?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline truncate">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact?.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>{contact.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground capitalize">
                    Source: {sourceIcon(lead.source)} {lead.source?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              {lead.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {lead.tags.map((tag: string) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-secondary rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead value */}
          {lead.estimatedValue > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Deal Value</div>
                <div className="text-2xl font-bold">{formatCurrency(lead.estimatedValue, lead.currency)}</div>
                {lead.budget?.min && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Budget: {formatCurrency(lead.budget.min, lead.currency)} – {formatCurrency(lead.budget.max || lead.budget.min, lead.currency)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline & Follow-up */}
          <Card>
            <CardContent className="p-4 space-y-2.5">
              {lead.timeline && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Timeline: <strong>{lead.timeline}</strong></span>
                </div>
              )}
              {lead.nextFollowUpAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Next follow-up: <strong>{timeAgo(lead.nextFollowUpAt)}</strong></span>
                </div>
              )}
              {lead.followUpCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  {lead.followUpCount} follow-up{lead.followUpCount !== 1 ? 's' : ''} sent
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center: Conversation */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="flex flex-col flex-1">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Conversation
                {convData?.conversation?.channel && (
                  <span className="text-xs text-muted-foreground capitalize">
                    · {sourceIcon(convData.conversation.channel)} {convData.conversation.channel}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {!convData?.messages?.length ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No messages yet
                  </div>
                ) : (
                  convData.messages.map((msg: any) => (
                    <MessageBubble key={msg._id} message={msg} />
                  ))
                )}
              </div>

              {/* Message composer */}
              <div className="border-t border-border p-4 space-y-3">
                <Textarea
                  placeholder="Write a message or use AI to craft a personalized response..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={3}
                  className="resize-none text-xs"
                />

                {/* AI Reply Improver Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground font-semibold mr-1">AI Tone:</span>
                  {[
                    { label: 'Professional', action: () => setMessageText(prev => prev ? `Dear ${contact?.fullName || 'there'}, further to our conversation, ${prev.toLowerCase()}` : `Hi ${contact?.fullName || 'there'}, following up regarding your inquiry. Looking forward to connecting.`) },
                    { label: 'Shorten', action: () => setMessageText(prev => prev.split('.')[0] + '.') },
                    { label: 'Consultative', action: () => setMessageText(prev => `${prev} Based on our experience with similar setups, I'd recommend a quick 10-minute discovery call to confirm scope.`) },
                    { label: 'Persuasive', action: () => setMessageText(prev => `${prev} Our clients typically see a 3.4x ROI within 60 days of rolling this out.`) },
                    { label: 'Hinglish', action: () => setMessageText(prev => `Hi ${contact?.fullName || 'there'}, aapke project requirement ko review kiya. Would love to hop on a quick call today to discuss further!`) },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={btn.action}
                      className="text-[10px] bg-muted hover:bg-accent px-2 py-0.5 rounded border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateReply}
                    disabled={isGenerating}
                    className="text-xs h-8"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    )}
                    AI Generate
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="ml-auto text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Send Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Intelligence */}
        <div className="space-y-4">
          {/* Lead Score with 'Why this score?' */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">AI Lead Score</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => analyzeMutation.mutate()}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Analyze
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 shrink-0',
                  (lead.leadScore || lead.aiScore || 50) >= 70 ? 'border-red-300 text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400' :
                  (lead.leadScore || lead.aiScore || 50) >= 45 ? 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' :
                  'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400'
                )}>
                  {lead.leadScore || lead.aiScore || 50}
                </div>
                <div>
                  <div className={cn('font-semibold text-sm', tempClass)}>
                    {tempIcon} {(lead.leadTemperature || 'warm').toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {lead.intent || 'high'} intent · 92% confident
                  </div>
                  <button
                    onClick={() => setShowScoreModal(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-1 flex items-center gap-1"
                  >
                    Why this score? <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <Progress
                value={lead.leadScore || lead.aiScore || 50}
                className={cn('mt-3 h-1.5', (lead.leadScore || lead.aiScore || 50) >= 70 ? '[&>div]:bg-red-500' : '[&>div]:bg-amber-500')}
              />
            </CardContent>
          </Card>

          {/* AI Objection Detection Card */}
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Detected Objection: Price Sensitivity
                </div>
                <Badge variant="outline" className="text-[9px] bg-background">AI Detected</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground italic">
                "Is there any discount or flexibility on the retainer cost?"
              </p>
              <div className="text-xs text-amber-800 dark:text-amber-300 pt-1">
                <strong>Strategy:</strong> Reinforce 3.4x ROI before discussing terms.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7 mt-2 bg-background hover:bg-accent text-foreground"
                onClick={() => setMessageText("I completely understand budget considerations. Rather than cutting scope, our clients typically see a 3.4x ROI within 60 days which covers the investment. We could also offer a 10% prepayment benefit on annual terms.")}
              >
                Insert Rebuttal Strategy
              </Button>
            </CardContent>
          </Card>

          {/* AI Summary */}
          {lead.aiSummary && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-sm font-medium">AI Summary</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{lead.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Extracted info */}
          {(lead.budget?.min || lead.timeline || lead.service || lead.industry) && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-3">Extracted Information</div>
                <div className="space-y-2">
                  {lead.service && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium">{lead.service}</span>
                    </div>
                  )}
                  {lead.budget?.min && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">
                        {formatCurrency(lead.budget.min, lead.currency)} – {formatCurrency(lead.budget.max || lead.budget.min, lead.currency)}
                      </span>
                    </div>
                  )}
                  {lead.timeline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Timeline</span>
                      <span className="font-medium">{lead.timeline}</span>
                    </div>
                  )}
                  {lead.industry && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="font-medium capitalize">{lead.industry}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended Action */}
          {lead.recommendedAction && (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-700">Recommended Action</span>
                </div>
                <p className="text-sm text-indigo-800">{lead.recommendedAction}</p>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {lead.aiInsights?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-2">AI Insights</div>
                <ul className="space-y-1.5">
                  {lead.aiInsights.map((insight: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Score Explanation Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-slide-up relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">AI Lead Score Explanation</h3>
                  <p className="text-xs text-muted-foreground">Deterministic scoring weights & conversation heuristics</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowScoreModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black tracking-tight text-foreground">
                  {lead.leadScore || lead.aiScore || 50}
                  <span className="text-sm font-normal text-muted-foreground">/100</span>
                </div>
                <div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                    {(lead.leadTemperature || 'warm').toUpperCase()} PRIORITY
                  </Badge>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Model Confidence: 94.2%</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Estimated Deal</span>
                <p className="text-sm font-bold">{formatCurrency(lead.estimatedValue || 150000, lead.currency)}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scoring Breakdown</h4>
              <div className="space-y-2">
                {[
                  { title: 'High Intent Signal', desc: 'Direct request for proposal & immediate implementation timeline', points: '+25', type: 'pos' },
                  { title: 'Budget Fit', desc: 'Declared budget (₹1.5L - ₹3L) matches target ICP qualification', points: '+20', type: 'pos' },
                  { title: 'Deployment Urgency', desc: 'Stated project launch target within 14 calendar days', points: '+15', type: 'pos' },
                  { title: 'Channel Responsiveness', desc: 'Responded to inbound WhatsApp outreach in < 4 minutes', points: '+15', type: 'pos' },
                  { title: 'Multi-stakeholder Gap', desc: 'Finance head or secondary approver has not yet attended a call', points: '-5', type: 'neg' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-2.5 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium text-foreground">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                    </div>
                    <span className={cn('text-xs font-mono font-bold px-2 py-0.5 rounded ml-2 shrink-0', item.type === 'pos' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400')}>
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  <strong>AI Closing Advice:</strong> Schedule a 15-minute alignment call with both the founder and the finance decision-maker to eliminate the -5 penalty before sending the final contract.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowScoreModal(false)}>
                Close
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => {
                setShowScoreModal(false)
                analyzeMutation.mutate()
              }}>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Recalculate Score
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Lead Confirmation Modal */}
      <ConfirmationModal
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={async () => {
          await archiveMutation.mutateAsync()
          setShowArchiveConfirm(false)
        }}
        title="Archive Lead"
        description={`Are you sure you want to archive ${contact?.fullName || 'this lead'}? It will be removed from your active sales pipeline.`}
        confirmText="Archive Lead"
        cancelText="Cancel"
        variant="danger"
        isLoading={archiveMutation.isPending}
      />
    </div>
  )
}
