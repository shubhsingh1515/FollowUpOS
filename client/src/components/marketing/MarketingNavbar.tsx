import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sparkles, ArrowRight, Menu, X, ChevronDown, Bot, Zap,
  Layers, ShieldCheck, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setServicesDropdownOpen(false)
  }, [location.pathname])

  const navLinks = [
    { label: 'Services & Solutions', href: '/services', badge: 'New' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Integrations', href: '/integrations-showcase' },
    { label: 'Pricing', href: '/pricing' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#090A0E]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-indigo-200 transition-colors">
              FollowUpOS
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full px-4 py-1.5 border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
          <Link
            to="/"
            className={cn(
              'text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors',
              location.pathname === '/'
                ? 'text-white bg-white/10 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            Overview
          </Link>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5',
                  isActive
                    ? 'text-white bg-white/10 shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-semibold">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/today">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold h-8.5 rounded-full px-4 py-2 gap-1.5">
                Go to Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8.5 rounded-full px-4 py-2 shadow-md shadow-indigo-600/30 gap-1.5 transition-all hover:scale-[1.02]"
                >
                  Start Free <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0D13] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-3 animate-slide-up shadow-2xl">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium',
                location.pathname === '/' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-zinc-300 hover:bg-white/5'
              )}
            >
              Overview
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between',
                  location.pathname === link.href ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-zinc-300 hover:bg-white/5'
                )}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link to="/today">
                <Button className="w-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold h-9 py-2 rounded-xl">
                  Go to Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 text-xs h-9 rounded-xl">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-9 rounded-xl shadow-lg shadow-indigo-600/25">
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
