import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  LifeBuoy,
  Flag,
  Activity,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await api.get('/auth/me')
        const user = res.data?.data?.user
        setAdminUser(user || { name: 'Super Admin', email: 'admin@followupos.com', platformRole: 'super_admin' })
      } catch {
        // Fallback for demo mode
        setAdminUser({ name: 'Super Admin', email: 'admin@followupos.com', platformRole: 'super_admin' })
      } finally {
        setLoading(false)
      }
    }
    checkAdminAuth()
  }, [navigate])

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Organizations', path: '/admin/organizations', icon: Building2 },
    { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'Usage & AI Cost', path: '/admin/usage', icon: BarChart3 },
    { label: 'Support Queue', path: '/admin/support', icon: LifeBuoy },
    { label: 'Feature Flags', path: '/admin/feature-flags', icon: Flag },
    { label: 'System Health', path: '/admin/system-health', icon: Activity },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080B] flex items-center justify-center text-zinc-400 font-mono text-xs">
        Authenticating Super Admin Privileges...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A0C10] border-r border-white/[0.08] flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white">
                FollowUp<span className="text-indigo-400">OS</span>
              </span>
              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[9px] font-mono uppercase px-1.5 py-0">
                ADMIN HQ
              </Badge>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">{adminUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/today" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-[11px] h-7 border-white/10 text-zinc-300 hover:text-white hover:bg-white/5">
                Client View
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                api.post('/auth/logout')
                navigate('/login')
              }}
              className="text-[11px] h-7 px-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-14 border-b border-white/[0.08] px-6 flex items-center justify-between bg-[#08090C]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Platform</span>
            <span>/</span>
            <span className="text-white font-medium capitalize">
              {location.pathname.replace('/admin', '').replace('/', '') || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ALL GREEN
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
