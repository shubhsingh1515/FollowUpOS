import { useState } from 'react'
import { LifeBuoy, CheckCircle2, MessageSquare, Send, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

export function AdminSupportPage() {
  const [tickets, setTickets] = useState([
    {
      id: 'tick_001',
      orgName: 'Apex Growth Consultancy',
      sender: 'Vikram Mehta (vikram@apexgrowth.in)',
      subject: 'WhatsApp Inbound Webhook phone format query',
      category: 'whatsapp',
      priority: 'high',
      status: 'open',
      createdAt: '25 mins ago',
      message: 'Hi team, do phone numbers need the +91 country code when submitting via the universal lead API, or does FollowUpOS normalize them automatically?',
      responses: []
    },
    {
      id: 'tick_002',
      orgName: 'Skyline Real Estate Brokers',
      sender: 'Priya Nambiar (priya@skylinerealty.com)',
      subject: 'Add 5 additional sales rep seats to Agency plan',
      category: 'billing',
      priority: 'medium',
      status: 'in_progress',
      createdAt: '2 hours ago',
      message: 'We are expanding our Dubai broker branch and need to confirm seat allocation.',
      responses: [
        { senderType: 'admin', senderName: 'FollowUpOS Support', message: 'Hi Priya, Agency tier includes 25 seats by default! You have 13 seats remaining to invite.' }
      ]
    }
  ])

  const [activeTicket, setActiveTicket] = useState<any>(tickets[0])
  const [replyText, setReplyText] = useState('')

  const handleSendReply = () => {
    if (!replyText.trim()) return
    const updated = {
      ...activeTicket,
      status: 'resolved',
      responses: [
        ...activeTicket.responses,
        { senderType: 'admin', senderName: 'Super Admin', message: replyText }
      ]
    }
    setActiveTicket(updated)
    setTickets(tickets.map((t) => (t.id === activeTicket.id ? updated : t)))
    setReplyText('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Customer Support Queue</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Resolve customer inquiries, handle billing escalations, and manage enterprise SLAs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118] p-4 space-y-3">
          <span className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">
            Active Tickets ({tickets.length})
          </span>
          <div className="space-y-2">
            {tickets.map((t) => {
              const isSelected = activeTicket?.id === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">{t.orgName}</span>
                    <Badge
                      className={`text-[9px] font-mono uppercase ${
                        t.status === 'open'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {t.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium line-clamp-1">{t.subject}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{t.category}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ticket Detail & Reply */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#0E1118] p-6 space-y-6 flex flex-col justify-between">
          {activeTicket ? (
            <div className="space-y-5">
              <div className="border-b border-white/[0.08] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{activeTicket.subject}</h3>
                  <Badge className="bg-indigo-600 text-white text-[10px] font-mono">
                    Priority: {activeTicket.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>Workspace: {activeTicket.orgName}</span>
                  <span>·</span>
                  <span>{activeTicket.sender}</span>
                </div>
              </div>

              {/* Initial message */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
                  <span className="font-bold text-white">{activeTicket.sender}</span>
                  <span>{activeTicket.createdAt}</span>
                </div>
                <p className="text-zinc-200 leading-relaxed">{activeTicket.message}</p>
              </div>

              {/* Thread responses */}
              {activeTicket.responses?.map((resp: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-indigo-300 font-mono text-[11px]">
                    <span className="font-bold">{resp.senderName}</span>
                    <span>Admin Reply</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed">{resp.message}</p>
                </div>
              ))}

              {/* Reply box */}
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <span className="text-xs font-bold text-white">Send Resolution Reply</span>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a clear, authoritative support response..."
                  className="bg-black/40 border-white/10 text-xs min-h-[90px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendReply}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-5 gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Send & Mark Resolved
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 text-xs font-mono">
              Select a support ticket from the queue
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSupportPage
