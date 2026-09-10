import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Bot, Send, Sparkles, User, ArrowRight, CheckCircle2,
  Clock, Flame, HelpCircle, ShieldCheck, CornerDownLeft,
  RotateCcw, Zap, ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import api from '@/lib/api'

interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  data?: any
  timestamp: string
}

export default function CopilotPage() {
  const navigate = useNavigate()
  const [inputQuery, setInputQuery] = useState('')
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Hello Arjun! I'm your FollowUpOS Sales Copilot. I analyze your leads, conversations, and pipeline to give you actionable next steps. What would you like to review?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const queryMutation = useMutation({
    mutationFn: async (queryText: string) => {
      const res = await api.post('/copilot/query', { query: queryText })
      return res.data.data
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: data.answer?.text || 'I analyzed your query based on current pipeline records.',
          data: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    },
  })

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery
    if (!query.trim() || queryMutation.isPending) return

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInputQuery('')
    queryMutation.mutate(query)
  }

  const quickPrompts = [
    'Which leads should I contact today?',
    "Show me leads that haven't been followed up with.",
    'Which hot leads haven\'t replied?',
    "Summarize today's sales activity.",
    'Show me opportunities likely to close this month.',
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 h-[calc(100vh-5rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            FollowUpOS Copilot
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your dedicated sales execution intelligence assistant.
          </p>
        </div>

        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 py-1 px-2.5">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Human-in-the-loop Guardrails
        </Badge>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-1">Ask:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={queryMutation.isPending}
            className="text-xs whitespace-nowrap bg-muted hover:bg-accent text-foreground px-3 py-1.5 rounded-full border transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Stream */}
      <div className="flex-1 overflow-y-auto border border-border rounded-xl p-4 space-y-4 bg-card shadow-xs min-h-0">
        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[85%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-muted/80 text-foreground rounded-bl-xs border border-border/40'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Structured Lead Cards Card */}
                {msg.data?.leads && (
                  <div className="space-y-2 pt-1 w-full">
                    {msg.data.leads.map((lead: any, lIdx: number) => (
                      <div
                        key={lIdx}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="p-3 rounded-lg border bg-background hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{lead.name}</span>
                            <span className="text-muted-foreground">({lead.company})</span>
                            <Badge variant="destructive" className="text-[9px]">
                              Score: {lead.score}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{lead.reason}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-indigo-600 shrink-0">
                          Open <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Structured Deals Table Card */}
                {msg.data?.deals && (
                  <div className="p-3 rounded-lg border bg-background text-xs space-y-2 w-full">
                    <div className="font-semibold text-foreground border-b pb-1.5">
                      Opportunities Likely to Close:
                    </div>
                    {msg.data.deals.map((deal: any, dIdx: number) => (
                      <div key={dIdx} className="flex items-center justify-between text-[11px] py-1 border-b border-border/40 last:border-0">
                        <div>
                          <span className="font-medium text-foreground">{deal.name}</span>
                          <span className="text-muted-foreground ml-2">({deal.stage})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">{deal.probability}% win</span>
                          <span className="font-semibold">₹{(deal.expectedRevenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {msg.data.totalForecast && (
                      <div className="pt-1.5 text-right font-bold text-indigo-600">
                        Total: {msg.data.totalForecast}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[10px] text-muted-foreground px-1">
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                    ME
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}

        {queryMutation.isPending && (
          <div className="flex gap-3 items-center text-xs text-muted-foreground py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>Analyzing sales conversations & pipeline intelligence...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Composer */}
      <div className="relative shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Copilot (e.g., 'Which leads should I contact today?' or 'Summarize daily performance')..."
              className="pr-10 text-xs h-11"
              disabled={queryMutation.isPending}
            />
          </div>
          <Button
            type="submit"
            disabled={!inputQuery.trim() || queryMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-5"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Send
          </Button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 px-1">
          <span>Press Enter to ask Copilot</span>
          <span>Never executes irreversible actions without user confirmation</span>
        </div>
      </div>
    </div>
  )
}
