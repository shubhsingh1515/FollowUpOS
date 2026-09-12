import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, Send, Sparkles, Phone, Mail, MessageSquare,
  Clock, CheckCircle, Flame, User, RefreshCw, Bot, MoreVertical,
  Paperclip, CornerDownRight, Zap, ArrowRight, ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  formatDate, getInitials, getScoreColor,
  temperatureLabel, sourceIcon, timeAgo, cn,
} from '@/lib/utils'
import api from '@/lib/api'

export default function InboxPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [activeChannel, setActiveChannel] = useState<string>('all')
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'ai_drafts'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch leads with messages
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['inbox-leads', activeChannel, search],
    queryFn: async () => {
      const res = await api.get('/leads', {
        params: {
          limit: 30,
          source: activeChannel !== 'all' ? activeChannel : undefined,
          search: search || undefined,
        },
      })
      return res.data.data.leads || []
    },
  })

  // Selected lead
  const selectedLead = leadsData?.find((l: any) => l._id === selectedThreadId) || leadsData?.[0]
  const currentLeadId = selectedLead?._id
  const currentContact = typeof selectedLead?.contactId === 'object' ? selectedLead?.contactId : null
  const currentLeadName = currentContact?.fullName || selectedLead?.name || selectedLead?.title || 'Inbound Prospect'
  const currentEmail = currentContact?.email || selectedLead?.email
  const currentPhone = currentContact?.phone || selectedLead?.phone
  const currentCompany = currentContact?.company || selectedLead?.company

  // Fetch conversation messages for selected lead
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['lead-messages', currentLeadId],
    queryFn: async () => {
      if (!currentLeadId) return []
      const res = await api.get(`/leads/${currentLeadId}/conversation`)
      return res.data.data?.messages || []
    },
    enabled: !!currentLeadId,
    refetchInterval: 6000,
  })

  // Auto-scroll to bottom on messages load/change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesData])

  // Fetch AI suggested response
  const { data: aiDraft, isLoading: draftLoading, refetch: regenerateDraft } = useQuery({
    queryKey: ['ai-draft', currentLeadId],
    queryFn: async () => {
      if (!currentLeadId) return null
      const res = await api.post(`/leads/${currentLeadId}/ai-generate`, {
        tone: 'professional',
      })
      return res.data.data?.reply || res.data.data?.generatedMessage || null
    },
    enabled: !!currentLeadId,
    staleTime: 60000,
  })

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ text, channel }: { text: string; channel: string }) => {
      return api.post(`/leads/${currentLeadId}/messages`, {
        content: text,
        body: text,
        channel: channel || selectedLead?.source || 'whatsapp',
        direction: 'outbound',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-messages', currentLeadId] })
      queryClient.invalidateQueries({ queryKey: ['inbox-leads'] })
      setReplyMessage('')
    },
  })

  const handleSend = () => {
    if (!replyMessage.trim() || !currentLeadId) return
    sendMutation.mutate({
      text: replyMessage,
      channel: selectedLead?.source || 'whatsapp',
    })
  }

  const handleUseAiDraft = (text: string) => {
    setReplyMessage(text)
  }

  const channels = [
    { id: 'all', label: 'All Channels' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'email', label: 'Email', icon: '✉️' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'sms', label: 'SMS', icon: '📱' },
    { id: 'website', label: 'Website', icon: '🌐' },
  ]

  const { icon: headerTempIcon, className: headerTempClass } = temperatureLabel(selectedLead?.leadTemperature || 'warm')

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col gap-3 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Omnichannel Inbox
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage conversations from WhatsApp, Email, SMS, Website, and Socials in one unified place.
          </p>
        </div>

        {/* Channel filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {channels.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChannel(c.id)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1',
                activeChannel === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {c.icon && <span>{c.icon}</span>}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inbox Container */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-0 border rounded-2xl bg-card overflow-hidden shadow-sm">
        {/* Left Column: Thread List */}
        <div className="md:col-span-4 border-r border-border flex flex-col h-full bg-muted/10">
          <div className="p-3 border-b border-border space-y-2 bg-background/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-background"
              />
            </div>
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  'flex-1 py-1 rounded-lg text-center font-medium transition-colors text-[11px]',
                  activeTab === 'all' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={cn(
                  'flex-1 py-1 rounded-lg text-center font-medium transition-colors text-[11px]',
                  activeTab === 'unread' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                Hot Leads
              </button>
              <button
                onClick={() => setActiveTab('ai_drafts')}
                className={cn(
                  'flex-1 py-1 rounded-lg text-center font-medium transition-colors text-[11px] flex items-center justify-center gap-1',
                  activeTab === 'ai_drafts' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                AI Drafts
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {leadsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : !leadsData || leadsData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No active conversations found
              </div>
            ) : (
              leadsData
                .filter((lead: any) => {
                  if (activeTab === 'unread') return lead.leadTemperature === 'hot'
                  if (activeTab === 'ai_drafts') return lead.leadTemperature === 'hot' || (lead.leadScore || 0) >= 70
                  return true
                })
                .map((lead: any) => {
                  const contact = typeof lead.contactId === 'object' ? lead.contactId : null
                  const name = contact?.fullName || lead.name || lead.title || 'Inbound Lead'
                  const company = contact?.company || lead.company
                  const score = lead.leadScore ?? lead.aiScore ?? 50
                  const temp = lead.leadTemperature || lead.temperature || 'warm'
                  const preview = lead.lastMessagePreview || lead.aiSummary || (lead.service ? `Inquiry for ${lead.service}` : 'Active sales conversation')
                  const isSelected = (selectedLead?._id || leadsData[0]?._id) === lead._id
                  const { icon: tempIcon } = temperatureLabel(temp)

                  return (
                    <div
                      key={lead._id}
                      onClick={() => setSelectedThreadId(lead._id)}
                      className={cn(
                        'p-3 cursor-pointer transition-all relative flex items-start gap-3',
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600'
                          : 'hover:bg-accent/40'
                      )}
                    >
                      <Avatar className="w-10 h-10 shrink-0 mt-0.5 border border-border/50">
                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-bold">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {name}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {timeAgo(lead.lastContactAt || lead.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs">{sourceIcon(lead.source)}</span>
                          <span className="text-[11px] text-muted-foreground font-medium truncate">
                            {company || lead.service || 'Direct Inquiry'}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground truncate mt-1 line-clamp-1">
                          {preview}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-bold ${getScoreColor(score)}`}>
                          {score} pts
                        </span>
                        <span className="text-xs">{tempIcon}</span>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>

        {/* Center / Right Column: Conversation Stream & Messaging */}
        {selectedLead ? (
          <div className="md:col-span-8 flex flex-col h-full bg-card">
            {/* Thread Header */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/10">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                    {getInitials(currentLeadName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-foreground">{currentLeadName}</h2>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', headerTempClass)}>
                      {headerTempIcon} {selectedLead.leadTemperature || 'warm'}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {sourceIcon(selectedLead.source)} {selectedLead.source}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {currentCompany && (
                      <span className="font-medium text-foreground/80">{currentCompany}</span>
                    )}
                    {currentEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {currentEmail}
                      </span>
                    )}
                    {currentPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {currentPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/leads/${selectedLead._id}`)}
                  className="text-xs h-8 gap-1.5"
                >
                  View Lead Dossier
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/5">
              {messagesLoading ? (
                <div className="space-y-4 p-2">
                  <Skeleton className="h-16 w-3/4 rounded-2xl" />
                  <Skeleton className="h-16 w-3/4 ml-auto rounded-2xl" />
                  <Skeleton className="h-16 w-2/3 rounded-2xl" />
                </div>
              ) : !messagesData || messagesData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-foreground">No messages in this thread yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Send an instant AI follow-up note below to engage {currentLeadName}.
                  </p>
                </div>
              ) : (
                messagesData.map((msg: any, idx: number) => {
                  const isOutbound = msg.direction === 'outbound'
                  const content = msg.content || msg.body || ''

                  return (
                    <div
                      key={msg._id || idx}
                      className={cn('flex flex-col', isOutbound ? 'items-end' : 'items-start')}
                    >
                      <div className="flex items-start gap-2 max-w-[82%]">
                        {!isOutbound && (
                          <Avatar className="w-7 h-7 mt-0.5 shrink-0">
                            <AvatarFallback className="text-[10px] bg-muted font-bold">
                              {getInitials(currentLeadName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed',
                            isOutbound
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : 'bg-card text-foreground rounded-bl-sm border border-border/70'
                          )}
                        >
                          <p className="whitespace-pre-wrap">{content}</p>
                          {msg.aiGenerated && (
                            <div className={cn(
                              'flex items-center gap-1 mt-1.5 text-[10px] font-medium',
                              isOutbound ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'
                            )}>
                              <Sparkles className="w-3 h-3" />
                              <span>AI Generated Touch</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-muted-foreground">
                        <span className="uppercase font-mono">{msg.channel || selectedLead.source}</span>
                        <span>•</span>
                        <span>{formatDate(msg.createdAt)}</span>
                        {msg.deliveryStatus && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{msg.deliveryStatus}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Assistant Banner / Suggestion Drawer */}
            {aiDraft && (
              <div className="mx-4 mb-2 p-3 bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl flex flex-col gap-2 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Copilot Draft
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[11px] text-indigo-600 dark:text-indigo-400 px-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                      onClick={() => regenerateDraft()}
                      disabled={draftLoading}
                    >
                      <RefreshCw className={cn('w-3 h-3 mr-1', draftLoading && 'animate-spin')} />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 gap-1 shadow-sm"
                      onClick={() => handleUseAiDraft(aiDraft)}
                    >
                      <CornerDownRight className="w-3 h-3" />
                      Insert into Reply
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-indigo-950 dark:text-indigo-200 italic line-clamp-3 bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/60">
                  "{aiDraft}"
                </p>
              </div>
            )}

            {/* Reply Input Bar */}
            <div className="p-3.5 border-t border-border bg-background/80">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Reply to ${currentLeadName} via ${selectedLead.source || 'channel'}...`}
                    className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!replyMessage.trim() || sendMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 shrink-0 rounded-xl shadow-sm gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 px-1">
                <span>Press ↵ Enter to send, Shift+Enter for new line</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Zap className="w-3 h-3" /> Real-time channel sync active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 flex flex-col items-center justify-center text-muted-foreground p-8">
            <User className="w-12 h-12 mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium">Select a conversation on the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
