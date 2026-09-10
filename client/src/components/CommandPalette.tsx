import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Calendar, Users, GitBranch, MessageSquare, Zap,
  BarChart3, Settings, CreditCard, Sparkles, Plus, Clock,
  ArrowRight, X, Command, Bot, LayoutDashboard, CheckSquare
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    setQuery('')
    navigate(href)
  }

  const navigationItems = [
    { label: 'Today (Priority Actions)', href: '/today', icon: CheckSquare, badge: 'Home' },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads Directory', href: '/leads', icon: Users },
    { label: 'Sales Pipeline (Kanban)', href: '/pipeline', icon: GitBranch },
    { label: 'Omnichannel Inbox', href: '/inbox', icon: MessageSquare },
    { label: 'Follow-ups Cadences', href: '/followups', icon: Calendar },
    { label: 'FollowUpOS Copilot', href: '/copilot', icon: Bot, badge: 'AI' },
    { label: 'Sales Analytics & ROI', href: '/analytics', icon: BarChart3 },
    { label: 'Follow-up Automations', href: '/automations', icon: Zap },
    { label: 'Integrations & Webhooks', href: '/integrations', icon: Sparkles },
    { label: 'Workspace Settings', href: '/settings', icon: Settings },
    { label: 'Billing & Plans', href: '/billing', icon: CreditCard },
  ]

  const quickActions = [
    { label: 'Create New Lead', href: '/leads?new=true', icon: Plus },
    { label: 'Ask Copilot a Question', href: '/copilot', icon: Sparkles },
    { label: 'Schedule Follow-up Task', href: '/followups', icon: Clock },
  ]

  const filteredNav = navigationItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const filteredActions = quickActions.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-background/80 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-muted/20">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, search leads, or ask Copilot (e.g. 'Today', 'Pipeline', 'Priya')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5">
            ESC
          </Badge>
        </div>

        {/* Results Stream */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
          {/* Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground px-2.5 py-1.5 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {filteredActions.map((action, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelect(action.href)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <action.icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{action.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          {filteredNav.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground px-2.5 py-1.5 uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-0.5">
                {filteredNav.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelect(item.href)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-muted text-muted-foreground flex items-center justify-center">
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                          {item.badge}
                        </Badge>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands. Try searching for <span className="font-semibold text-foreground">"Today"</span>, <span className="font-semibold text-foreground">"Pipeline"</span>, or ask <span className="font-semibold text-foreground">"Copilot"</span>.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-3.5 py-2 border-t border-border bg-muted/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-background border px-1 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-background border px-1 rounded">↵</kbd> select</span>
            <span><kbd className="font-mono bg-background border px-1 rounded">esc</kbd> close</span>
          </div>
          <span className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Command className="w-3 h-3" /> FollowUpOS V2
          </span>
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={() => onOpenChange(false)} />
    </div>
  )
}
