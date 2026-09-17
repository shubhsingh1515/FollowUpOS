import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Inbox, Users, GitBranch, Calendar,
  BookOpen, MessageSquare, BarChart3, Zap, Plug,
  Settings, CreditCard, LogOut, Menu, X, Bell,
  Sparkles, ChevronDown, CheckSquare, Bot, Moon, Sun,
  Search, Plus, ShieldCheck, Laptop, Flame,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials, cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'
import CommandPalette from '@/components/CommandPalette'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import api from '@/lib/api'

interface NavGroup {
  title: string
  items: {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    badgeColor?: string
  }[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      { label: "Today's Priorities", href: '/today', icon: CheckSquare, badge: 'Daily', badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
      { label: 'Leads Directory', href: '/leads', icon: Users },
      { label: 'Deal Pipeline', href: '/pipeline', icon: GitBranch },
      { label: 'Omnichannel Inbox', href: '/inbox', icon: MessageSquare },
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { label: 'AI Sales Copilot', href: '/copilot', icon: Bot, badge: 'AI', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
      { label: 'Analytics & ROI', href: '/analytics', icon: BarChart3 },
      { label: 'Follow-ups Queue', href: '/followups', icon: Calendar },
    ],
  },
  {
    title: 'Automation',
    items: [
      { label: 'Cadences & Rules', href: '/automations', icon: Zap },
    ],
  },
  {
    title: 'Connect',
    items: [
      { label: 'Channels & Widget', href: '/integrations', icon: Plug },
      { label: 'Contacts Book', href: '/contacts', icon: BookOpen },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Billing & Quotas', href: '/billing', icon: CreditCard },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Team', href: '/team', icon: Users },
    ],
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, organization, logout } = useAuthStore()
  const { theme, setTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await api.post('/auth/logout')
    } catch {}
    logout()
    window.location.href = '/login'
  }

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light')
    else setTheme('dark')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      'flex flex-col h-full bg-card border-r border-border select-none',
      mobile ? 'w-full' : 'w-64'
    )}>
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground">FollowUpOS</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
              v2.0
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground truncate">AI Sales Operations</div>
        </div>
      </div>

      {/* Organization Badge Card */}
      <div className="px-3 py-2.5 border-b border-border/60">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
          <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            {organization?.name?.[0] || 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {organization?.name || 'GrowthScale Agency'}
            </div>
            <div className="text-[10px] text-muted-foreground capitalize font-medium">
              Growth Plan (₹2,999/mo)
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
        </div>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && item.href !== '/' && location.pathname.startsWith(item.href))
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => mobile && setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                  >
                    <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded border font-mono font-bold',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                          : item.badgeColor || 'bg-muted text-muted-foreground border-border'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors group">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
              {getInitials(user?.name || 'Demo User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">{user?.name || 'Demo User'}</div>
            <div className="text-[10px] text-muted-foreground capitalize truncate">
              {user?.role ? user.role.replace('_', ' ') : 'Account Admin'}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowLogoutConfirm(true)
            }}
            id="sidebar-logout-btn"
            className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-all cursor-pointer z-10 shrink-0"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-72 h-full bg-card shadow-2xl animate-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                {organization?.name || 'GrowthScale Agency'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-muted-foreground font-medium">AI Follow-up Engine Active</span>
              </div>
            </div>
          </div>

          {/* Quick Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted/80 text-muted-foreground text-xs transition-colors max-w-sm w-full"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left truncate">Search leads, deals, actions...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border shadow-xs text-muted-foreground">
              <span>⌘</span>K
            </kbd>
          </button>

          <div className="flex-1" />

          {/* Top Bar Actions */}
          <div className="flex items-center gap-2">
            {/* Ask Copilot Shortcut */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/copilot')}
              className="hidden sm:flex items-center gap-1.5 text-xs h-8 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask Copilot
            </Button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>

            {/* Header Sign Out Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogoutConfirm(true)}
              id="header-logout-btn"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 ml-1"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out of FollowUpOS"
        description="Are you sure you want to sign out? You will need to log back in to access your sales cockpit and active pipeline."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        icon={<LogOut className="w-5 h-5 text-red-500" />}
        isLoading={isLoggingOut}
      />
    </div>
  )
}
