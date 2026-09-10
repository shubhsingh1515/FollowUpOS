import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Filter, Send, Sparkles, Phone, Mail, MessageSquare,
  Clock, CheckCircle, Flame, User, RefreshCw, Bot, MoreVertical,
  Paperclip, CornerDownRight, Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, getInitials, getScoreColor } from '@/lib/utils'
import api from '@/lib/api'

export default function InboxPage() {
  const queryClient = useQueryClient()
  const [activeChannel, setActiveChannel] = useState<string>('all')
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'ai_drafts'>('all')

  // Fetch leads with messages
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['inbox-leads', activeChannel, search],
    queryFn: async () => {
      const res = await api.get('/leads', {
        params: {
          limit: 30,
          channel: activeChannel !== 'all' ? activeChannel : undefined,
          search: search || undefined,
        },
      })
      return res.data.data.leads || []
    },
  })

  // Selected lead
  const selectedLead = leadsData?.find((l: any) => l._id === selectedThreadId) || leadsData?.[0]
  const currentLeadId = selectedLead?._id

  // Fetch conversation messages for selected lead
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['lead-messages', currentLeadId],
    queryFn: async () => {
      if (!currentLeadId) return []
      const res = await api.get(`/leads/${currentLeadId}/conversation`)
      return res.data.data.messages || []
    },
    enabled: !!currentLeadId,
    refetchInterval: 5000,
  })

  // Fetch AI suggested response
  const { data: aiDraft, isLoading: draftLoading, refetch: regenerateDraft } = useQuery({
    queryKey: ['ai-draft', currentLeadId],
    queryFn: async () => {
      if (!currentLeadId) return null
      const res = await api.post(`/leads/${currentLeadId}/ai-generate`, {
        purpose: 'follow_up',
        tone: 'professional',
      })
      return res.data.data.generatedMessage || null
    },
    enabled: !!currentLeadId,
    staleTime: 60000,
  })

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ text, channel }: { text: string; channel: string }) => {
      return api.post(`/leads/${currentLeadId}/messages`, {
        body: text,
        channel: channel || 'email',
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
      channel: selectedLead?.source || 'email',
    })
  }

  const handleUseAiDraft = (text: string) => {
    setReplyMessage(text)
  }

  const channels = [
    { id: 'all', label: 'All Channels' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'sms', label: 'SMS' },
    { id: 'website', label: 'Website' },
  ]

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
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
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                activeChannel === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inbox Container */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 border rounded-xl bg-card overflow-hidden shadow-sm">
        {/* Left Column: Thread List */}
        <div className="md:col-span-4 border-r flex flex-col h-full bg-background/50">
          <div className="p-3 border-b space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 rounded-md text-center font-medium transition-colors ${
                  activeTab === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-1 rounded-md text-center font-medium transition-colors ${
                  activeTab === 'unread' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setActiveTab('ai_drafts')}
                className={`flex-1 py-1 rounded-md text-center font-medium transition-colors ${
                  activeTab === 'ai_drafts' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                AI Drafts
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {leadsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : !leadsData || leadsData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No active conversations found
              </div>
            ) : (
              leadsData.map((lead: any) => {
                const isSelected = (selectedLead?._id || leadsData[0]?._id) === lead._id
                return (
                  <div
                    key={lead._id}
                    onClick={() => setSelectedThreadId(lead._id)}
                    className={`p-3 cursor-pointer transition-colors relative flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-l-indigo-600'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                        {getInitials(lead.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {lead.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDate(lead.lastContactedAt || lead.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0">
                          {lead.source}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground capitalize truncate">
                          {lead.serviceRequired || lead.company || 'Service Inquiry'}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {lead.lastMessage || lead.notes?.[lead.notes?.length - 1]?.text || 'No messages yet'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold ${getScoreColor(lead.aiScore || 50)}`}>
                        {lead.aiScore || 50} pts
                      </span>
                      {lead.temperature === 'hot' && (
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Center / Right Column: Conversation Stream & Intelligence */}
        {selectedLead ? (
          <div className="md:col-span-8 flex flex-col h-full bg-card">
            {/* Thread Header */}
            <div className="p-3.5 border-b flex items-center justify-between bg-background/30">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                    {getInitials(selectedLead.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm text-foreground">{selectedLead.name}</h2>
                    <Badge variant={selectedLead.temperature === 'hot' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {selectedLead.temperature || 'warm'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {selectedLead.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {selectedLead.email}
                      </span>
                    )}
                    {selectedLead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedLead.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(`/leads/${selectedLead._id}`, '_blank')}>
                  View Full Profile
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-3/4" />
                  <Skeleton className="h-16 w-3/4 ml-auto" />
                  <Skeleton className="h-16 w-2/3" />
                </div>
              ) : !messagesData || messagesData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium">No messages recorded in this conversation yet</p>
                  <p className="text-xs">Send an initial email or follow-up note below to start tracking.</p>
                </div>
              ) : (
                messagesData.map((msg: any, idx: number) => {
                  const isOutbound = msg.direction === 'outbound'
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                          isOutbound
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-muted/80 text-foreground rounded-bl-xs border border-border/40'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-muted-foreground">
                        <span className="uppercase font-mono">{msg.channel || 'message'}</span>
                        <span>•</span>
                        <span>{formatDate(msg.createdAt)}</span>
                        {msg.status && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{msg.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* AI Assistant Banner / Suggestion Drawer */}
            {aiDraft && (
              <div className="mx-4 mb-2 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Follow-up Suggestion
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] text-indigo-600 px-2"
                      onClick={() => regenerateDraft()}
                      disabled={draftLoading}
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${draftLoading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2"
                      onClick={() => handleUseAiDraft(aiDraft)}
                    >
                      <CornerDownRight className="w-3 h-3 mr-1" />
                      Insert into Reply
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-indigo-950 dark:text-indigo-200 italic line-clamp-2">
                  "{aiDraft}"
                </p>
              </div>
            )}

            {/* Reply Input Bar */}
            <div className="p-3 border-t bg-background/60">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Reply to ${selectedLead.name} via ${selectedLead.source || 'channel'}...`}
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4 shrink-0"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Send
                </Button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 px-1">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-3 h-3" /> Auto follow-up enabled
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 flex flex-col items-center justify-center text-muted-foreground p-8">
            <User className="w-12 h-12 mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium">Select a conversation on the left to start replying</p>
          </div>
        )}
      </div>
    </div>
  )
}
